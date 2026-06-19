using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using FlashShop.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace FlashShop.Infrastructure.AI;

public sealed class ClaudeService(
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration,
    ILogger<ClaudeService> logger) : IAiService
{
    private const string DefaultModel = "claude-sonnet-4-20250514";
    private const string MessagesEndpoint = "https://api.anthropic.com/v1/messages";
    private const string AnthropicVersion = "2023-06-01";
    private const int DefaultMaxTokens = 1024;

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public async Task<string> CompleteAsync(IReadOnlyCollection<ChatMessage> messages, CancellationToken cancellationToken = default)
    {
        var apiKey = configuration["AI:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return "AI service is not enabled. Please configure AI:ApiKey.";
        }

        if (messages.Count == 0)
        {
            return string.Empty;
        }

        var systemPrompt = string.Join(
            "\n\n",
            messages
                .Where(message => string.Equals(message.Role, "system", StringComparison.OrdinalIgnoreCase))
                .Select(message => message.Content)
                .Where(content => !string.IsNullOrWhiteSpace(content)));

        var request = new ClaudeMessagesRequest(
            Model: configuration["AI:Model"] ?? DefaultModel,
            MaxTokens: DefaultMaxTokens,
            System: string.IsNullOrWhiteSpace(systemPrompt) ? null : systemPrompt,
            Messages: messages
                .Where(message => !string.Equals(message.Role, "system", StringComparison.OrdinalIgnoreCase))
                .Select(message => new ClaudeMessage(NormalizeRole(message.Role), message.Content))
                .ToArray());

        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, MessagesEndpoint)
        {
            Content = JsonContent.Create(request, options: JsonOptions)
        };
        httpRequest.Headers.Add("x-api-key", apiKey);
        httpRequest.Headers.Add("anthropic-version", AnthropicVersion);
        httpRequest.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        using var client = httpClientFactory.CreateClient("Claude");
        using var response = await client.SendAsync(httpRequest, cancellationToken);
        var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            logger.LogWarning(
                "Claude API request failed with status {StatusCode}: {ResponseBody}",
                (int)response.StatusCode,
                responseBody);
            return "AI service is temporarily unavailable.";
        }

        var claudeResponse = JsonSerializer.Deserialize<ClaudeMessagesResponse>(responseBody, JsonOptions);
        return claudeResponse?.Content.FirstOrDefault(item => item.Type == "text")?.Text ?? string.Empty;
    }

    private static string NormalizeRole(string role)
        => string.Equals(role, "assistant", StringComparison.OrdinalIgnoreCase) ? "assistant" : "user";

    private sealed record ClaudeMessagesRequest(
        [property: JsonPropertyName("model")] string Model,
        [property: JsonPropertyName("max_tokens")] int MaxTokens,
        [property: JsonPropertyName("system")] string? System,
        [property: JsonPropertyName("messages")] IReadOnlyCollection<ClaudeMessage> Messages);

    private sealed record ClaudeMessage(
        [property: JsonPropertyName("role")] string Role,
        [property: JsonPropertyName("content")] string Content);

    private sealed record ClaudeMessagesResponse(
        [property: JsonPropertyName("content")] IReadOnlyCollection<ClaudeContent> Content);

    private sealed record ClaudeContent(
        [property: JsonPropertyName("type")] string Type,
        [property: JsonPropertyName("text")] string? Text);
}
