/** Shared easing: confident deceleration, no bounce. Mirrors `--ease-out` in global.css. */
export const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';

export function prefersReducedMotion(): boolean {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Web Animations helper for feedback that has to restart on every action (CSS transitions cannot).
 * Skipped entirely with reduced motion; the state change itself (text, colour) is already applied.
 */
export function pulse(
	el: Element | null | undefined,
	keyframes: Keyframe[],
	options: KeyframeAnimationOptions = {},
): Animation | undefined {
	if (!el || prefersReducedMotion()) return undefined;
	return el.animate(keyframes, { duration: 300, easing: EASE_OUT, ...options });
}
