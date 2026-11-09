"use client";

import { useRef } from "react";
import { GoalCard } from "@/components/goal-card";
import { GoalColumn } from "@/components/goal-column";
import { moveId, type Goal } from "@/lib/goals";
import { useKeyboardReorder } from "@/lib/use-keyboard-reorder";
import { useSortableList } from "@/lib/use-sortable-list";

type SortableGoalColumnProps = {
  goals: Goal[];
  today: string;
  checkedIds: ReadonlySet<string>;
  onCheckedChange: (id: string, checked: boolean) => void;
  onComplete: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onReorder: (ids: string[]) => void;
};

export function SortableGoalColumn({
  goals,
  today,
  checkedIds,
  onCheckedChange,
  onComplete,
  onDelete,
  onReorder,
}: SortableGoalColumnProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const ids = goals.map((goal) => goal.id);

  const { orderedIds, pickedId, message, getHandleProps } = useKeyboardReorder(
    ids,
    onReorder,
  );
  const goalsById = new Map(goals.map((goal) => [goal.id, goal]));
  const displayedGoals = orderedIds.flatMap((id) => goalsById.get(id) ?? []);

  useSortableList(
    listRef,
    (from, to) => onReorder(moveId(ids, from, to)),
    goals.length > 1,
  );

  return (
    <>
      <GoalColumn
        title="Current goals"
        count={goals.length}
        emptyMessage="Goals you are working on show up here. Add your first goal to get started."
        className="border-line bg-surface [&_.sortable-chosen]:shadow-md [&_.sortable-ghost]:opacity-40"
        listRef={listRef}
      >
        {displayedGoals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            today={today}
            checked={checkedIds.has(goal.id)}
            onCheckedChange={(checked) => onCheckedChange(goal.id, checked)}
            onComplete={() => onComplete(goal)}
            onDelete={() => onDelete(goal.id)}
            showHandle={goals.length > 1}
            handleProps={getHandleProps(goal.id, goal.title)}
            picked={goal.id === pickedId}
          />
        ))}
      </GoalColumn>
      <p role="status" aria-live="polite" className="sr-only">
        {message}
      </p>
    </>
  );
}
