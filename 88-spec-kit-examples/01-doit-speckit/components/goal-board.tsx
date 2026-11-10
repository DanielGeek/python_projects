"use client";

import { useState } from "react";
import { GoalDialog } from "@/components/goal-dialog";
import { CompletedGoalCard } from "@/components/completed-goal-card";
import { DeleteGoalDialog } from "@/components/delete-goal-dialog";
import { GoalColumn } from "@/components/goal-column";
import { SortableGoalColumn } from "@/components/sortable-goal-list";
import { Button } from "@/components/ui/button";
import {
  addGoal,
  completeGoal,
  deleteGoal,
  reorderGoals,
  useGoalOrder,
  useGoals,
} from "@/lib/goal-store";
import { orderCurrent, sortCompleted } from "@/lib/goals";
import { useToday } from "@/lib/use-today";

export function GoalBoard() {
  const goals = useGoals();
  const order = useGoalOrder();
  const today = useToday();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [checkedIds, setCheckedIds] = useState<ReadonlySet<string>>(new Set());
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  if (goals === null || today === null) return <BoardPlaceholder />;

  const currentGoals = orderCurrent(goals, order);
  const completedGoals = sortCompleted(goals);
  const pendingDelete = goals.find((goal) => goal.id === pendingDeleteId);

  function setChecked(id: string, checked: boolean) {
    setCheckedIds((previous) => {
      const next = new Set(previous);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function handleConfirmDelete() {
    if (pendingDeleteId === null) return;
    deleteGoal(pendingDeleteId);
    setChecked(pendingDeleteId, false);
    setPendingDeleteId(null);
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 md:py-10">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Doit</h1>
        <Button className="h-11 px-5 text-base" onClick={() => setIsAddOpen(true)}>
          Add goal
        </Button>
      </header>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-start">
        <SortableGoalColumn
          goals={currentGoals}
          today={today}
          checkedIds={checkedIds}
          onCheckedChange={setChecked}
          onComplete={(goal) => {
            completeGoal(goal.id, today);
            setChecked(goal.id, false);
          }}
          onDelete={setPendingDeleteId}
          onReorder={reorderGoals}
        />
        <GoalColumn
          title="Completed goals"
          count={completedGoals.length}
          emptyMessage="Goals you finish move here, so you can see what you have achieved."
          className="border-line bg-surface"
        >
          {completedGoals.map((goal) => (
            <CompletedGoalCard key={goal.id} goal={goal} />
          ))}
        </GoalColumn>
      </div>
      <GoalDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        today={today}
        onSubmit={addGoal}
      />
      <DeleteGoalDialog
        open={pendingDelete !== undefined}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteId(null);
        }}
        goalTitle={pendingDelete?.title ?? ""}
        onConfirm={handleConfirmDelete}
      />
    </main>
  );
}

function BoardPlaceholder() {
  return (
    <main
      aria-busy="true"
      className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 md:py-10"
    >
      <h1 className="text-3xl font-semibold tracking-tight">Doit</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="h-48 rounded-2xl bg-line" />
        <div className="h-48 rounded-2xl bg-line" />
      </div>
    </main>
  );
}
