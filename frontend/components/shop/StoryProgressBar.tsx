interface StoryProgressBarProps {
  count: number;
  current: number;
  progress: number;
}

export function StoryProgressBar({ count, current, progress }: Readonly<StoryProgressBarProps>) {
  return (
    <div className="flex gap-1 px-3 py-2">
      {Array.from({ length: Math.max(count, 1) }).map((_, index) => {
        const width = index < current ? 100 : index === current ? Math.min(Math.max(progress, 0), 100) : 0;
        return (
          <div className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30" key={index}>
            <div className="h-full rounded-full bg-white/90 transition-[width] duration-100 ease-linear" style={{ width: `${width}%` }} />
          </div>
        );
      })}
    </div>
  );
}
