import { byId } from '../utils/dom';
import { showToast } from './toast';

function initMobileMenu(): void {
	const burger = byId('burger');
	const menu = byId('mobile-nav');

	const setOpen = (open: boolean) => {
		menu.dataset.open = String(open);
		burger.setAttribute('aria-expanded', String(open));
	};

	burger.addEventListener('click', () => setOpen(menu.dataset.open !== 'true'));
	menu.addEventListener('click', (e) => {
		if ((e.target as HTMLElement).closest('a')) setOpen(false);
	});
}

/** In-page anchors scroll smoothly; links to pages that do not exist yet ("#") show a notice. */
function initAnchors(): void {
	document.addEventListener('click', (e) => {
		const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
		if (!link) return;

		e.preventDefault();
		const href = link.getAttribute('href') ?? '#';
		if (href === '#') {
			showToast('Esta página llega pronto', { withAction: false });
			return;
		}
		document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	});
}

export function initNavigation(): void {
	initMobileMenu();
	initAnchors();
}
