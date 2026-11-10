import { Button } from "@/components/ui/button";
import { formatDisplayDate, type Goal } from "@/lib/goals";

type CompletedGoalCardProps = {
  goal: Goal;
  onReopen: () => void;
};

export function CompletedGoalCard({ goal, onReopen }: CompletedGoalCardProps) {
  return (
    <li className="rounded-xl border border-border bg-done p-4 shadow-sm">
      <p className="font-medium break-words">{goal.title}</p>
      {goal.completedAt && (
        <p className="mt-1 text-sm text-done-foreground">
          Completed {formatDisplayDate(goal.completedAt)}
        </p>
      )}
      <Button
        variant="outline"
        className="mt-3 h-11"
        aria-label={`Reopen goal: ${goal.title}`}
        onClick={onReopen}
      >
        Reopen
      </Button>
    </li>
  );
}
