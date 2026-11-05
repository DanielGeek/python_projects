import { WEIGHTS } from '../config/products';
import { formatPrice } from '../utils/format';
import { pulse } from '../utils/motion';

function selectOption(card: HTMLElement, group: 'weight' | 'grind', index: string): void {
	card.dataset[group] = index;
	card.querySelectorAll<HTMLElement>(`[data-${group}-option]`).forEach((pill) => {
		pill.setAttribute('aria-pressed', String(pill.dataset[`${group}Option`] === index));
	});

	if (group === 'weight') {
		const price = Number(card.dataset.basePrice) * WEIGHTS[Number(index)].factor;
		const label = card.querySelector('[data-price]');
		if (label) {
			label.textContent = formatPrice(price);
			pulse(label, [
				{ opacity: 0.4, transform: 'translateY(4px)' },
				{ opacity: 1, transform: 'translateY(0)' },
			], { duration: 240 });
		}
	}
}

export function initProductSelectors(): void {
	document.addEventListener('click', (e) => {
		const pill = (e.target as HTMLElement).closest<HTMLElement>('[data-weight-option],[data-grind-option]');
		const card = pill?.closest<HTMLElement>('[data-product]');
		if (!pill || !card) return;

		if (pill.dataset.weightOption !== undefined) selectOption(card, 'weight', pill.dataset.weightOption);
		else if (pill.dataset.grindOption !== undefined) selectOption(card, 'grind', pill.dataset.grindOption);
	});
}
