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
  type GoalInputErrors,
} from "@/lib/goals";

type AddGoalDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  today: string;
  onAdd: (title: string, endDate: string) => void;
};

export function AddGoalDialog({
  open,
  onOpenChange,
  today,
  onAdd,
}: AddGoalDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Add a goal</DialogTitle>
          <DialogDescription>
            What do you want to achieve, and by when?
          </DialogDescription>
        </DialogHeader>
        {/* Mounted only while the dialog is open, so the form resets on every open. */}
        <AddGoalForm
          today={today}
          onCancel={() => onOpenChange(false)}
          onSubmit={(title, endDate) => {
            onAdd(title, endDate);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

type AddGoalFormProps = {
  today: string;
  onCancel: () => void;
  onSubmit: (title: string, endDate: string) => void;
};

function AddGoalForm({ today, onCancel, onSubmit }: AddGoalFormProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const titleErrorId = `${id}-title-error`;
  const endDateId = `${id}-end-date`;
  const endDateErrorId = `${id}-end-date-error`;

  const [title, setTitle] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errors, setErrors] = useState<GoalInputErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validateGoalInput(title, endDate, today);
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
          min={today}
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
          Add goal
        </Button>
      </DialogFooter>
    </form>
  );
}
