import { byId } from '../utils/dom';

let timer: number | undefined;

export function hideToast(): void {
	byId('toast').dataset.open = 'false';
}

export function showToast(message: string, options: { withAction?: boolean } = {}): void {
	const { withAction = true } = options;
	byId('toast-text').textContent = message;
	byId('toast-action').hidden = !withAction;
	byId('toast').dataset.open = 'true';
	window.clearTimeout(timer);
	timer = window.setTimeout(hideToast, 3200);
}
