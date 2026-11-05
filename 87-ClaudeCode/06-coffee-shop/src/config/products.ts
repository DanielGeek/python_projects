import type { Product, RoastLevel, WeightOption } from '../types';

export const WEIGHTS: WeightOption[] = [
	{ label: '250 g', factor: 1 },
	{ label: '500 g', factor: 1.85 },
	{ label: '1 kg', factor: 3.4 },
];

export const GRINDS = ['Grano', 'Molido', 'Cápsula'] as const;

export const ROAST_LABELS: Record<RoastLevel, string> = {
	1: 'Claro',
	2: 'Medio',
	3: 'Oscuro',
};

/** Bar colour per roast level (the darkest roast uses a warmer tone to stay visible on charcoal). */
export const ROAST_TONES: Record<RoastLevel, string> = {
	1: '#D4AC66',
	2: '#A8743C',
	3: '#C28A4E',
};

export const FEATURED_PRODUCTS: Product[] = [
	{
		id: 'huila',
		name: 'Huila',
		country: 'Colombia',
		altitude: 1750,
		notes: ['Caramelo', 'Naranja', 'Cacao'],
		roast: 2,
		basePrice: 18,
		badge: { label: 'Más vendido', featured: true },
		bagColor: '#1d1a17',
	},
	{
		id: 'sidamo',
		name: 'Sidamo',
		country: 'Etiopía',
		altitude: 2100,
		notes: ['Jazmín', 'Melocotón', 'Té negro'],
		roast: 1,
		basePrice: 21,
		badge: { label: 'Nuevo' },
		bagColor: '#5C3414',
	},
	{
		id: 'antigua',
		name: 'Antigua',
		country: 'Guatemala',
		altitude: 1600,
		notes: ['Chocolate', 'Nuez', 'Panela'],
		roast: 3,
		basePrice: 17,
		bagColor: '#2E2C29',
	},
	{
		id: 'casa',
		name: 'Mezcla de la casa',
		country: 'Colombia',
		originLabel: 'Colombia + Etiopía',
		notes: ['Avellana', 'Frutos rojos'],
		roast: 2,
		basePrice: 16,
		bagColor: '#3b2414',
	},
];
