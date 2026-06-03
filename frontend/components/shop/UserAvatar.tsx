import { assetUrl } from "@/lib/utils/assetUrl";

const colors = ["#EF4444", "#F59E0B", "#22C55E", "#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"];

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: number;
}

export function UserAvatar({ avatarUrl, name, size = 32 }: Readonly<UserAvatarProps>) {
  if (avatarUrl) {
    return <img alt={name} className="rounded-full object-cover" src={assetUrl(avatarUrl)} style={{ height: size, width: size }} />;
  }

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
      style={{ backgroundColor: getColorFromName(name), height: size, width: size }}
    >
      {name.trim().charAt(0).toUpperCase() || "U"}
    </span>
  );
}

function getColorFromName(name: string) {
  let hash = 0;
  for (let index = 0; index < name.length; index++) {
    hash = name.charCodeAt(index) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
