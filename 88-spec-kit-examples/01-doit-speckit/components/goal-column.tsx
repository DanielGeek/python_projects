import type { ReactNode, Ref } from "react";
import { cn } from "@/lib/utils";

type GoalColumnProps = {
  title: string;
  count: number;
  emptyMessage: string;
  className?: string;
  listRef?: Ref<HTMLUListElement>;
  children: ReactNode;
};

export function GoalColumn({
  title,
  count,
  emptyMessage,
  className,
  listRef,
  children,
}: GoalColumnProps) {
  return (
    <section
      aria-label={title}
      className={cn(
        "flex min-h-48 flex-col rounded-2xl border p-4 md:max-h-[calc(100dvh-10rem)]",
        className,
      )}
    >
      <h2 className="flex items-baseline gap-2 text-lg font-semibold">
        {title}
        <span className="text-sm font-normal text-muted-foreground">
          {count}
        </span>
      </h2>
      {count === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <ul
          ref={listRef}
          className="mt-4 flex min-h-0 flex-col gap-3 overflow-y-auto"
        >
          {children}
        </ul>
      )}
    </section>
  );
}
