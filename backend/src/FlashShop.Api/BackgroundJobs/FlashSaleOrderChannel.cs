using System.Threading.Channels;

namespace FlashShop.Api.BackgroundJobs;

public sealed class FlashSaleOrderChannel
{
    private readonly Channel<FlashSaleOrderMessage> _channel =
        Channel.CreateUnbounded<FlashSaleOrderMessage>(new UnboundedChannelOptions
        {
            SingleReader = true,
            SingleWriter = false
        });

    public ChannelWriter<FlashSaleOrderMessage> Writer => _channel.Writer;
    public ChannelReader<FlashSaleOrderMessage> Reader => _channel.Reader;
}
