import { byId } from '../utils/dom';
import { pulse } from '../utils/motion';

let timer: number | undefined;

export function hideToast(): void {
	byId('toast').dataset.open = 'false';
}

export function showToast(message: string, options: { withAction?: boolean } = {}): void {
	const { withAction = true } = options;
	byId('toast-text').textContent = message;
	byId('toast-action').hidden = !withAction;
	const toast = byId('toast');
	// Repeat adds while the toast is already up: re-pulse the check so the new action is acknowledged.
	if (toast.dataset.open === 'true') {
		pulse(byId('toast-check'), [{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 300 });
	}
	toast.dataset.open = 'true';
	window.clearTimeout(timer);
	timer = window.setTimeout(hideToast, 3200);
}
