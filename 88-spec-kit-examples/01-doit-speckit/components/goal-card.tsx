import type { ButtonHTMLAttributes } from "react";
import { AlarmClockIcon, GripVerticalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { daysLeftLabel, isDueSoon, type Goal } from "@/lib/goals";

type GoalCardProps = {
  goal: Goal;
  today: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  onComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
  /** Shows the "Move" handle used to reorder the goal. */
  showHandle: boolean;
  handleProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  /** True while the goal is picked up for keyboard reordering. */
  picked?: boolean;
};

export function GoalCard({
  goal,
  today,
  checked,
  onCheckedChange,
  onComplete,
  onEdit,
  onDelete,
  showHandle,
  handleProps,
  picked = false,
}: GoalCardProps) {
  const dueSoon = isDueSoon(goal, today);

  return (
    <li
      data-goal-id={goal.id}
      className={cn(
        "rounded-xl border p-4 shadow-sm",
        picked && "ring-2 ring-ring ring-offset-2 ring-offset-background",
        dueSoon
          ? "border-2 border-urgent-foreground bg-urgent"
          : "border-border bg-card",
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={checked}
          onCheckedChange={onCheckedChange}
          aria-label={`Select goal: ${goal.title}`}
          className="mt-0.5 size-6 after:-inset-2.5"
        />
        <div className="min-w-0 flex-1">
          <p className="font-medium break-words">{goal.title}</p>
          <p
            className={cn(
              "mt-1 flex items-center gap-1.5 text-sm",
              dueSoon ? "font-medium text-urgent-foreground" : "text-muted-foreground",
            )}
          >
            {dueSoon && <AlarmClockIcon className="size-4" aria-hidden="true" />}
            {daysLeftLabel(goal.endDate, today)}
          </p>
        </div>
        {showHandle && (
          <button
            type="button"
            aria-label={`Move goal: ${goal.title}`}
            {...handleProps}
            className="goal-handle inline-flex min-h-11 min-w-11 shrink-0 cursor-grab touch-none items-center justify-center gap-1 rounded-lg px-2 text-sm text-ink-soft focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none aria-pressed:bg-line active:cursor-grabbing"
          >
            <GripVerticalIcon className="size-4" aria-hidden="true" />
            Move
          </button>
        )}
      </div>
      {checked && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button className="h-11" onClick={onComplete}>
            Move to completed
          </Button>
          <Button variant="outline" className="h-11" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="destructive" className="h-11" onClick={onDelete}>
            Delete permanently
          </Button>
        </div>
      )}
    </li>
  );
}
