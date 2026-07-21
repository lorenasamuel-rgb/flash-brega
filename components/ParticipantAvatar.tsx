export function ParticipantAvatar({
  url,
  nickname,
  size = "md",
}: {
  url?: string | null;
  nickname: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "h-12 w-12 text-lg",
    md: "h-16 w-16 text-xl",
    lg: "h-28 w-28 text-3xl",
  };

  const cls = sizes[size];

  if (url) {
    return (
      <img
        src={url}
        alt={nickname}
        className={`${cls} shrink-0 rounded-full border-2 border-pink-400 object-cover`}
      />
    );
  }

  return (
    <div
      className={`${cls} flex shrink-0 items-center justify-center rounded-full border-2 border-purple-500/50 bg-purple-900/60 font-black text-pink-300`}
    >
      {nickname.charAt(0).toUpperCase()}
    </div>
  );
}
