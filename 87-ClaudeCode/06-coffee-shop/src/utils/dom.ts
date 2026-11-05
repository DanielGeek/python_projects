/** Returns the element with the given id or throws, so scripts fail loudly if the markup drifts. */
export function byId<T extends HTMLElement = HTMLElement>(id: string): T {
	const el = document.getElementById(id);
	if (!el) throw new Error(`Missing element #${id}`);
	return el as T;
}

const ESCAPES: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
};

export function escapeHtml(value: string): string {
	return value.replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
}
