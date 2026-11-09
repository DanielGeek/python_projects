import { formatDisplayDate, type Goal } from "@/lib/goals";

type CompletedGoalCardProps = {
  goal: Goal;
};

export function CompletedGoalCard({ goal }: CompletedGoalCardProps) {
  return (
    <li className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="font-medium break-words">{goal.title}</p>
      {goal.completedAt && (
        <p className="mt-1 text-sm text-muted-foreground">
          Completed {formatDisplayDate(goal.completedAt)}
        </p>
      )}
    </li>
  );
}
