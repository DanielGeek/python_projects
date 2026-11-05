/** Formats a USD amount with a decimal comma, e.g. 18.5 -> "$18,50". */
export function formatPrice(amount: number): string {
	return '$' + amount.toFixed(2).replace('.', ',');
}
