import type { ReactNode } from "react";

export type AvatarSize = 38 | 40 | 44;

const initialFontSize: Record<AvatarSize, number> = {
  38: 16,
  40: 16,
  44: 17,
};

type AvatarProps = {
  size: AvatarSize;
  backgroundColor: string;
  color: string;
  initial?: string;
  children?: ReactNode;
};

export function Avatar({
  size,
  backgroundColor,
  color,
  initial,
  children,
}: AvatarProps) {
  return (
    <div
      style={{ width: size, height: size, backgroundColor, color }}
      className="flex flex-none items-center justify-center rounded-full"
    >
      {initial ? (
        <span
          className="font-display font-semibold"
          style={{ fontSize: initialFontSize[size] }}
        >
          {initial}
        </span>
      ) : (
        children
      )}
    </div>
  );
}
