export function assetUrl(url: string) {
  if (!url) {
    return url;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("/uploads")) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
    return `${apiUrl.replace(/\/api\/?$/, "")}${url}`;
  }

  return url;
}
