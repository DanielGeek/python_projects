import { useSyncExternalStore } from "react";
import { toDateKey } from "@/lib/goals";

function subscribe(onChange: () => void): () => void {
  const onVisibilityChange = () => {
    if (document.visibilityState === "visible") onChange();
  };
  document.addEventListener("visibilitychange", onVisibilityChange);
  return () =>
    document.removeEventListener("visibilitychange", onVisibilityChange);
}

function getSnapshot(): string {
  return toDateKey(new Date());
}

function getServerSnapshot(): null {
  return null;
}

/** Today's local date as `yyyy-MM-dd`, refreshed when the tab becomes visible. `null` on the server. */
export function useToday(): string | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
