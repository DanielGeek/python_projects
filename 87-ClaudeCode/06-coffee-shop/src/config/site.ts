import type { NavLink } from '../types';

export const SITE = {
	name: 'Nogal Café',
	shortName: 'Nogal',
	lang: 'es',
	title: 'Nogal Café — Café de especialidad tostado para tu taza',
	description:
		'Café de especialidad comprado directo a productores y tostado en pequeños lotes. Llega a tu puerta en su punto.',
} as const;

export const SHIPPING = {
	/** Subtotal (USD) from which shipping is free. */
	freeThreshold: 40,
	flatRate: 4.9,
} as const;

export const NAV_LINKS: NavLink[] = [
	{ label: 'Tienda', href: '#tienda' },
	{ label: 'Suscripción', href: '#suscripcion' },
	{ label: 'Nosotros', href: '#nosotros' },
	{ label: 'Guía', href: '#guia' },
];

export const MOBILE_NAV_LINKS: NavLink[] = [
	{ label: 'Tienda', href: '#tienda' },
	{ label: 'Suscripción', href: '#suscripcion' },
	{ label: 'Nosotros', href: '#nosotros' },
	{ label: 'Guía de preparación', href: '#guia' },
];

export const FOOTER_COLUMNS: { title: string; links: NavLink[] }[] = [
	{
		title: 'Tienda',
		links: [
			{ label: 'Todos los cafés', href: '#tienda' },
			{ label: 'En grano', href: '#tienda' },
			{ label: 'Molido', href: '#tienda' },
			{ label: 'Cápsulas', href: '#tienda' },
			{ label: 'Suscripción', href: '#suscripcion' },
		],
	},
	{
		title: 'Nogal',
		links: [
			{ label: 'Nosotros', href: '#nosotros' },
			{ label: 'Productores', href: '#nosotros' },
			{ label: 'Guía de preparación', href: '#guia' },
			{ label: 'Mi cuenta', href: '#' },
		],
	},
	{
		title: 'Ayuda',
		links: [
			{ label: 'Contacto', href: '#' },
			{ label: 'Preguntas frecuentes', href: '#' },
			{ label: 'Envíos', href: '#' },
			{ label: 'Devoluciones', href: '#' },
		],
	},
];

export const LEGAL_LINKS: NavLink[] = [
	{ label: 'Envíos', href: '#' },
	{ label: 'Devoluciones', href: '#' },
	{ label: 'Privacidad', href: '#' },
	{ label: 'Términos', href: '#' },
];

export const PAYMENT_METHODS = ['VISA', 'MC', 'AMEX', 'PayPal'] as const;
