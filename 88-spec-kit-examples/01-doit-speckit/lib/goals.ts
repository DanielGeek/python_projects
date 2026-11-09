import { differenceInCalendarDays, format, parseISO } from "date-fns";

export type GoalStatus = "current" | "completed";

export type Goal = {
  id: string;
  title: string;
  /** Local calendar date, `yyyy-MM-dd`. */
  endDate: string;
  status: GoalStatus;
  /** ISO 8601 timestamp; tie-breaker for ordering. */
  createdAt: string;
  /** Local calendar date, `yyyy-MM-dd`; `null` while the goal is current. */
  completedAt: string | null;
};

export const DUE_SOON_DAYS = 3;
export const TITLE_MAX_LENGTH = 100;

const DATE_KEY_FORMAT = "yyyy-MM-dd";
const DISPLAY_DATE_FORMAT = "MMM d, yyyy";

export function toDateKey(date: Date): string {
  return format(date, DATE_KEY_FORMAT);
}

export function daysLeft(endDate: string, today: string): number {
  return differenceInCalendarDays(parseISO(endDate), parseISO(today));
}

export function isDueSoon(goal: Goal, today: string): boolean {
  return (
    goal.status === "current" && daysLeft(goal.endDate, today) <= DUE_SOON_DAYS
  );
}

export function daysLeftLabel(endDate: string, today: string): string {
  const days = daysLeft(endDate, today);
  if (days === 0) return "Due today";
  if (days === 1) return "1 day left";
  if (days > 1) return `${days} days left`;
  if (days === -1) return "1 day overdue";
  return `${-days} days overdue`;
}

export function formatDisplayDate(date: string): string {
  return format(parseISO(date), DISPLAY_DATE_FORMAT);
}

export function sortCurrent(goals: Goal[]): Goal[] {
  return goals
    .filter((goal) => goal.status === "current")
    .sort(
      (a, b) =>
        a.endDate.localeCompare(b.endDate) ||
        a.createdAt.localeCompare(b.createdAt),
    );
}

export function sortCompleted(goals: Goal[]): Goal[] {
  return goals
    .filter((goal) => goal.status === "completed")
    .sort(
      (a, b) =>
        (b.completedAt ?? "").localeCompare(a.completedAt ?? "") ||
        b.createdAt.localeCompare(a.createdAt),
    );
}

export type GoalInputErrors = {
  title?: string;
  endDate?: string;
};

export function validateGoalInput(
  title: string,
  endDate: string,
  today: string,
): GoalInputErrors {
  const errors: GoalInputErrors = {};
  const trimmed = title.trim();

  if (trimmed.length === 0) {
    errors.title = "Enter a title for your goal.";
  } else if (trimmed.length > TITLE_MAX_LENGTH) {
    errors.title = `Keep the title to ${TITLE_MAX_LENGTH} characters or fewer.`;
  }

  if (endDate === "") {
    errors.endDate = "Pick an end date.";
  } else if (endDate < today) {
    errors.endDate = "Choose today or a later date.";
  }

  return errors;
}

export function isGoal(value: unknown): value is Goal {
  if (typeof value !== "object" || value === null) return false;
  const goal = value as Record<string, unknown>;
  return (
    typeof goal.id === "string" &&
    typeof goal.title === "string" &&
    typeof goal.endDate === "string" &&
    (goal.status === "current" || goal.status === "completed") &&
    typeof goal.createdAt === "string" &&
    (typeof goal.completedAt === "string" || goal.completedAt === null)
  );
}
