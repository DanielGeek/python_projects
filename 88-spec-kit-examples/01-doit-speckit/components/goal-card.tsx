import { AlarmClockIcon } from "lucide-react";
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
  onDelete: () => void;
};

export function GoalCard({
  goal,
  today,
  checked,
  onCheckedChange,
  onComplete,
  onDelete,
}: GoalCardProps) {
  const dueSoon = isDueSoon(goal, today);

  return (
    <li
      className={cn(
        "rounded-xl border p-4 shadow-sm",
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
      </div>
      {checked && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button className="h-11" onClick={onComplete}>
            Move to completed
          </Button>
          <Button variant="destructive" className="h-11" onClick={onDelete}>
            Delete permanently
          </Button>
        </div>
      )}
    </li>
  );
}
