import { useSyncExternalStore } from "react";
import { isGoal, type Goal } from "@/lib/goals";

const STORAGE_KEY = "doit:goals:v1";

const listeners = new Set<() => void>();

/** In-memory copy of the goals; `null` until first read on the client. */
let goals: Goal[] | null = null;

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

function handleStorageEvent(event: StorageEvent): void {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  goals = readFromStorage();
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

function getServerSnapshot(): null {
  return null;
}

function save(next: Goal[]): void {
  goals = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage is full or unavailable: keep the in-memory goals so the page stays usable.
  }
  notify();
}

/** All goals, or `null` while the first client snapshot is not available yet. */
export function useGoals(): Goal[] | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
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

export function deleteGoal(id: string): void {
  save(getSnapshot().filter((goal) => goal.id !== id));
}
