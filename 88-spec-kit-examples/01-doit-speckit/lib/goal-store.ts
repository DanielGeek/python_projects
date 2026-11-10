import { useSyncExternalStore } from "react";
import { isGoal, isIdList, orderCurrent, type Goal } from "@/lib/goals";

const STORAGE_KEY = "doit:goals:v1";
const ORDER_STORAGE_KEY = "doit:goal-order:v1";

const listeners = new Set<() => void>();

/** In-memory copy of the goals; `null` until first read on the client. */
let goals: Goal[] | null = null;

/** Manual order of current goal ids; `null` = never reordered, `undefined` = not read yet. */
let order: string[] | null | undefined;

function readFromStorage(): Goal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isGoal) : [];
  } catch {
    return [];
  }
}

function readOrderFromStorage(): string[] | null {
  try {
    const raw = localStorage.getItem(ORDER_STORAGE_KEY);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    return isIdList(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function handleStorageEvent(event: StorageEvent): void {
  if (event.key === null || event.key === STORAGE_KEY) {
    goals = readFromStorage();
  }
  if (event.key === null || event.key === ORDER_STORAGE_KEY) {
    order = readOrderFromStorage();
  }
  notify();
}

function notify(): void {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  if (listeners.size === 0) {
    window.addEventListener("storage", handleStorageEvent);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener("storage", handleStorageEvent);
    }
  };
}

function getSnapshot(): Goal[] {
  if (goals === null) goals = readFromStorage();
  return goals;
}

function getOrderSnapshot(): string[] | null {
  if (order === undefined) order = readOrderFromStorage();
  return order;
}

function getServerSnapshot(): null {
  return null;
}

function persist(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage is full or unavailable: keep the in-memory state so the page stays usable.
  }
}

function save(next: Goal[]): void {
  goals = next;
  persist(STORAGE_KEY, next);
  notify();
}

/** All goals, or `null` while the first client snapshot is not available yet. */
export function useGoals(): Goal[] | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Manual order of current goal ids, or `null` while the user has never reordered. */
export function useGoalOrder(): string[] | null {
  return useSyncExternalStore(subscribe, getOrderSnapshot, getServerSnapshot);
}

/** Saves the user's manual order; from now on the list is no longer sorted by end date. */
export function reorderGoals(ids: string[]): void {
  order = ids;
  persist(ORDER_STORAGE_KEY, ids);
  notify();
}

export function addGoal(title: string, endDate: string): void {
  const goal: Goal = {
    id: crypto.randomUUID(),
    title: title.trim(),
    endDate,
    status: "current",
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
  save([...getSnapshot(), goal]);
}

export function completeGoal(id: string, today: string): void {
  save(
    getSnapshot().map((goal) =>
      goal.id === id
        ? { ...goal, status: "completed", completedAt: today }
        : goal,
    ),
  );
}

export function updateGoal(id: string, title: string, endDate: string): void {
  const previousGoals = getSnapshot();
  if (!previousGoals.some((goal) => goal.id === id)) return;
  save(
    previousGoals.map((goal) =>
      goal.id === id ? { ...goal, title: title.trim(), endDate } : goal,
    ),
  );
}

/** Moves a completed goal back to Current, last in the list (a manual order is pinned and the goal appended). */
export function reopenGoal(id: string): void {
  const previousGoals = getSnapshot();
  if (!previousGoals.some((goal) => goal.id === id && goal.status === "completed")) return;
  const currentOrder = getOrderSnapshot();
  goals = previousGoals.map((goal) =>
    goal.id === id ? { ...goal, status: "current", completedAt: null } : goal,
  );
  persist(STORAGE_KEY, goals);
  if (currentOrder !== null) {
    order = [...orderCurrent(previousGoals, currentOrder).map((goal) => goal.id), id];
    persist(ORDER_STORAGE_KEY, order);
  }
  notify();
}

export function deleteGoal(id: string): void {
  save(getSnapshot().filter((goal) => goal.id !== id));
}
