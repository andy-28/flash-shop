import { extractYouTubeVideoId } from "@/lib/utils/youtube";

interface YouTubePlayerProps {
  url: string;
}

export function YouTubePlayer({ url }: Readonly<YouTubePlayerProps>) {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    return null;
  }

  return (
    <div className="aspect-video overflow-hidden rounded-xl border border-border-default bg-bg-secondary">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title="YouTube video player"
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
