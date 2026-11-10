"use client";

import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TITLE_MAX_LENGTH,
  validateGoalInput,
  type Goal,
  type GoalInputErrors,
} from "@/lib/goals";

type GoalDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  today: string;
  /** Present = edit this goal; absent = add a new one. */
  goal?: Goal;
  onSubmit: (title: string, endDate: string) => void;
};

export function GoalDialog({
  open,
  onOpenChange,
  today,
  goal,
  onSubmit,
}: GoalDialogProps) {
  const isEdit = goal !== undefined;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit goal" : "Add a goal"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the title or end date."
              : "What do you want to achieve, and by when?"}
          </DialogDescription>
        </DialogHeader>
        {/* Mounted only while the dialog is open, so the form resets on every open. */}
        <GoalForm
          today={today}
          goal={goal}
          onCancel={() => onOpenChange(false)}
          onSubmit={(title, endDate) => {
            onSubmit(title, endDate);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

type GoalFormProps = {
  today: string;
  goal?: Goal;
  onCancel: () => void;
  onSubmit: (title: string, endDate: string) => void;
};

function GoalForm({ today, goal, onCancel, onSubmit }: GoalFormProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const titleErrorId = `${id}-title-error`;
  const endDateId = `${id}-end-date`;
  const endDateErrorId = `${id}-end-date-error`;

  const [title, setTitle] = useState(goal?.title ?? "");
  const [endDate, setEndDate] = useState(goal?.endDate ?? "");
  const [errors, setErrors] = useState<GoalInputErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validateGoalInput(title, endDate, today, goal?.endDate);
    setErrors(found);
    if (found.title || found.endDate) return;
    onSubmit(title, endDate);
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor={titleId}>Title</Label>
        <Input
          id={titleId}
          value={title}
          maxLength={TITLE_MAX_LENGTH}
          onChange={(event) => setTitle(event.target.value)}
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={errors.title ? titleErrorId : undefined}
          className="h-11"
        />
        {errors.title && (
          <p id={titleErrorId} className="text-sm text-destructive">
            {errors.title}
          </p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor={endDateId}>End date</Label>
        <Input
          id={endDateId}
          type="date"
          value={endDate}
          min={goal && goal.endDate < today ? goal.endDate : today}
          onChange={(event) => setEndDate(event.target.value)}
          aria-invalid={errors.endDate ? true : undefined}
          aria-describedby={errors.endDate ? endDateErrorId : undefined}
          className="h-11"
        />
        {errors.endDate && (
          <p id={endDateErrorId} className="text-sm text-destructive">
            {errors.endDate}
          </p>
        )}
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} className="h-11">
          Cancel
        </Button>
        <Button type="submit" className="h-11">
          {goal ? "Save changes" : "Add goal"}
        </Button>
      </DialogFooter>
    </form>
  );
}
