import { SHIPPING } from '../config/site';
import type { CartItem, CartTotals } from '../types';

export function computeTotals(items: CartItem[]): CartTotals {
	const count = items.reduce((sum, item) => sum + item.qty, 0);
	const subtotal = items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
	const missingForFreeShipping = Math.max(0, SHIPPING.freeThreshold - subtotal);
	const shipping = items.length > 0 && missingForFreeShipping > 0 ? SHIPPING.flatRate : 0;

	return {
		count,
		subtotal,
		missingForFreeShipping,
		shipping,
		total: subtotal + shipping,
		progress: Math.min(100, (subtotal / SHIPPING.freeThreshold) * 100),
	};
}

export function makeCartKey(productId: string, weightIndex: number, grindIndex: number): string {
	return `${productId}-${weightIndex}-${grindIndex}`;
}
