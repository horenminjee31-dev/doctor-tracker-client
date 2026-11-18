import { cn } from "@/lib/cn";
import { avatarPalette, initials } from "@/lib/format";

const sizes = {
  sm: "size-9 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-lg",
  xl: "size-16 text-xl",
};

export function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold ring-1 ring-black/5",
        sizes[size],
        avatarPalette(name),
        className
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
