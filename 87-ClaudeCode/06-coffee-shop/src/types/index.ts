export type RoastLevel = 1 | 2 | 3;

export interface ProductBadge {
	label: string;
	/** Highlighted badge (caramel) instead of the default foam one. */
	featured?: boolean;
}

export interface Product {
	id: string;
	name: string;
	country: string;
	/** Altitude in metres, when the coffee is single-origin. */
	altitude?: number;
	/** Free-form origin text, used when there is no single country. */
	originLabel?: string;
	notes: string[];
	roast: RoastLevel;
	basePrice: number;
	badge?: ProductBadge;
	bagColor: string;
}

export interface WeightOption {
	label: string;
	/** Multiplier applied to the product base price. */
	factor: number;
}

export interface CartItem {
	key: string;
	productId: string;
	name: string;
	bagColor: string;
	weight: string;
	grind: string;
	unitPrice: number;
	qty: number;
}

export interface CartTotals {
	count: number;
	subtotal: number;
	missingForFreeShipping: number;
	shipping: number;
	total: number;
	/** 0–100, progress towards free shipping. */
	progress: number;
}

export interface NavLink {
	label: string;
	href: string;
}
