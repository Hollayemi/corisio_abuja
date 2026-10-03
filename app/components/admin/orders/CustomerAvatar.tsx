import { getInitials } from "./formatters";

export type CustomerAvatarProps = {
  name: string;
  /** Photo URL. Falls back to initials when missing. */
  src?: string | null;
  className?: string;
};

/** Round photo or initials ("RM") next to a customer's name. */
export function CustomerAvatar({ name, src, className = "size-9" }: CustomerAvatarProps) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-100 text-xs font-medium text-neutral-700 ${className}`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </span>
  );
}
