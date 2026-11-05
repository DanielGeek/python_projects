import { GRINDS, WEIGHTS } from '../config/products';
import { SHIPPING } from '../config/site';
import type { CartItem } from '../types';
import { computeTotals, makeCartKey } from '../utils/cart';
import { byId, escapeHtml } from '../utils/dom';
import { formatPrice } from '../utils/format';
import { pulse } from '../utils/motion';
import { hideToast, showToast } from './toast';

const items: CartItem[] = [];

const BAG_ICON = `<svg class="size-14 text-[#5a554e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z"/><path d="M9 10V6a3 3 0 0 1 6 0v4" stroke-linecap="round"/></svg>`;

function openCart(): void {
	byId('cart-drawer').dataset.open = 'true';
	byId('cart-drawer').setAttribute('aria-hidden', 'false');
	byId('cart-overlay').dataset.open = 'true';
	hideToast();
}

function closeCart(): void {
	byId('cart-drawer').dataset.open = 'false';
	byId('cart-drawer').setAttribute('aria-hidden', 'true');
	byId('cart-overlay').dataset.open = 'false';
}

type Change = { key: string; kind: 'new' | 'qty' };

function render(change?: Change): void {
	const totals = computeTotals(items);

	const badge = byId('cart-count');
	badge.textContent = String(totals.count);
	badge.dataset.on = String(totals.count > 0);

	byId('shipping-bar').querySelector('[data-ship-text]')!.innerHTML =
		totals.missingForFreeShipping > 0
			? `Te faltan <b class="text-caramel">${formatPrice(totals.missingForFreeShipping)}</b> para el envío gratis`
			: `<b class="text-caramel">¡Tienes envío gratis!</b>`;
	byId('shipping-bar').querySelector<HTMLElement>('[data-ship-fill]')!.style.width = `${totals.progress}%`;

	const list = byId('cart-items');
	const foot = byId('cart-foot');

	if (items.length === 0) {
		list.innerHTML = `<div class="flex flex-col items-center gap-[18px] px-4 py-16 text-center text-foam/70">${BAG_ICON}<p>Tu carrito está vacío.<br>Empieza por uno de nuestros cafés destacados.</p><a href="#tienda" class="btn-secondary" data-close>Ver cafés</a></div>`;
		foot.hidden = true;
		return;
	}

	foot.hidden = false;
	list.innerHTML = items
		.map(
			(item, i) => `<div data-key="${escapeHtml(item.key)}" class="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3.5 border-b border-foam/10 py-[18px]">
				<div class="thumb grid h-[76px] w-16 place-items-center rounded-lg" style="--bag:${escapeHtml(item.bagColor)}"><i class="relative h-11 w-[30px] rounded-[3px_3px_5px_5px]"></i></div>
				<div>
					<h4 class="m-0 font-serif text-[17px] font-semibold">${escapeHtml(item.name)}</h4>
					<small class="mt-0.5 mb-2.5 block text-xs text-foam/50">${escapeHtml(item.weight)} · ${escapeHtml(item.grind)}</small>
					<div class="inline-flex h-[34px] items-center rounded-full border border-foam/10">
						<button type="button" data-dec="${i}" aria-label="Quitar uno" class="size-[34px] cursor-pointer rounded-full text-[17px] transition-colors hover:bg-charcoal active:bg-foam/15">−</button>
						<span data-qty class="min-w-[22px] text-center text-sm font-semibold tabular-nums">${item.qty}</span>
						<button type="button" data-inc="${i}" aria-label="Añadir uno" class="size-[34px] cursor-pointer rounded-full text-[17px] transition-colors hover:bg-charcoal active:bg-foam/15">+</button>
					</div>
				</div>
				<div class="text-right font-semibold">${formatPrice(item.unitPrice * item.qty)}
					<button type="button" data-del="${i}" class="mt-2 ml-auto block cursor-pointer text-xs font-normal text-foam/50 underline transition-colors hover:text-foam">Eliminar</button>
				</div>
			</div>`,
		)
		.join('');

	foot.innerHTML = `
		<div class="flex justify-between text-[15px] text-foam/70"><span>Subtotal</span><span>${formatPrice(totals.subtotal)}</span></div>
		<div class="flex justify-between text-[15px] text-foam/70"><span>Envío</span><span>${totals.shipping ? formatPrice(totals.shipping) : 'Gratis'}</span></div>
		<div class="flex justify-between text-lg font-semibold"><span>Total</span><span data-total class="font-serif text-[22px] text-caramel tabular-nums">${formatPrice(totals.total)}</span></div>
		<a href="#" class="btn-primary w-full">Ir a pagar</a>
		<button type="button" class="btn-text self-center" data-close>Seguir comprando</button>`;

	if (!change) return;
	const row = list.querySelector<HTMLElement>(`[data-key="${CSS.escape(change.key)}"]`);
	if (change.kind === 'new') {
		pulse(row, [
			{ opacity: 0, transform: 'translateX(16px)' },
			{ opacity: 1, transform: 'translateX(0)' },
		], { duration: 380 });
	} else {
		pulse(row?.querySelector('[data-qty]'), [{ transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: 220 });
	}
	pulse(foot.querySelector('[data-total]'), [{ opacity: 0.5 }, { opacity: 1 }], { duration: 240 });
}

const addedTimers = new WeakMap<HTMLElement, number>();

/** Button confirms its own action for a moment, then returns to the label. */
function confirmButton(button: HTMLElement): void {
	const label = button.dataset.label ?? (button.dataset.label = button.textContent ?? '');
	button.innerHTML = '<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>Añadido';
	button.dataset.added = 'true';
	window.clearTimeout(addedTimers.get(button));
	addedTimers.set(
		button,
		window.setTimeout(() => {
			button.textContent = label;
			delete button.dataset.added;
		}, 1400),
	);
}

function addToCart(card: HTMLElement, button: HTMLElement): void {
	const weightIndex = Number(card.dataset.weight ?? 0);
	const grindIndex = Number(card.dataset.grind ?? 0);
	const productId = card.dataset.id ?? '';
	const key = makeCartKey(productId, weightIndex, grindIndex);

	const existing = items.find((item) => item.key === key);
	const kind: Change['kind'] = existing ? 'qty' : 'new';
	if (existing) {
		existing.qty += 1;
	} else {
		items.push({
			key,
			productId,
			name: card.dataset.name ?? '',
			bagColor: card.dataset.bag ?? '#1d1a17',
			weight: WEIGHTS[weightIndex].label,
			grind: GRINDS[grindIndex],
			unitPrice: Number(card.dataset.basePrice) * WEIGHTS[weightIndex].factor,
			qty: 1,
		});
	}

	render({ key, kind });

	pulse(byId('cart-count'), [{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 320 });
	confirmButton(button);
	// The bag on the card hops once: the action is acknowledged where the finger is.
	pulse(card.querySelector('.bag'), [
		{ transform: 'translateY(0)' },
		{ transform: 'translateY(-12px)', offset: 0.4 },
		{ transform: 'translateY(0)' },
	], { duration: 420 });

	showToast(`${card.dataset.name} · ${WEIGHTS[weightIndex].label} añadido al carrito`);
}

export function initCart(): void {
	byId('shipping-bar').innerHTML = `<p data-ship-text></p><div class="mt-2.5 h-1.5 overflow-hidden rounded-[3px] bg-charcoal"><i data-ship-fill class="block h-full rounded-[3px] bg-caramel transition-[width] duration-500 ease-out-expo" style="width:0%"></i></div>`;
	byId('open-cart').addEventListener('click', openCart);
	byId('close-cart').addEventListener('click', closeCart);
	byId('cart-overlay').addEventListener('click', closeCart);
	byId('toast-action').addEventListener('click', openCart);
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') closeCart();
	});

	document.addEventListener('click', (e) => {
		const button = (e.target as HTMLElement).closest<HTMLElement>('[data-add-to-cart]');
		const card = button?.closest<HTMLElement>('[data-product]');
		if (button && card) addToCart(card, button);
	});

	byId('cart-drawer').addEventListener('click', (e) => {
		const target = (e.target as HTMLElement).closest<HTMLElement>('[data-inc],[data-dec],[data-del],[data-close]');
		if (!target) return;
		if (target.hasAttribute('data-close')) {
			closeCart();
			return;
		}
		let change: Change | undefined;
		if (target.dataset.inc) {
			const item = items[Number(target.dataset.inc)];
			item.qty += 1;
			change = { key: item.key, kind: 'qty' };
		} else if (target.dataset.dec) {
			const i = Number(target.dataset.dec);
			const item = items[i];
			if (--item.qty < 1) items.splice(i, 1);
			else change = { key: item.key, kind: 'qty' };
		} else if (target.dataset.del) {
			items.splice(Number(target.dataset.del), 1);
		}
		render(change);
	});

	render();
}

// Exposed so other modules (e.g. tests) can reason about the shipping rule without importing config.
export const FREE_SHIPPING_THRESHOLD = SHIPPING.freeThreshold;
