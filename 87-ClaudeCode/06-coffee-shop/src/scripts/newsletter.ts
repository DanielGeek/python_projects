import { isValidEmail } from '../utils/validation';

export function initNewsletter(): void {
	const form = document.getElementById('news-form') as HTMLFormElement | null;
	if (!form) return;

	const input = form.querySelector<HTMLInputElement>('#email')!;
	const button = form.querySelector<HTMLButtonElement>('#news-button')!;
	const message = form.querySelector<HTMLElement>('#news-message')!;

	form.addEventListener('submit', (e) => {
		e.preventDefault();
		const value = input.value.trim();
		form.dataset.state = '';

		if (!isValidEmail(value)) {
			form.dataset.state = 'error';
			message.textContent = value
				? 'Revisa el formato del correo (ej. nombre@correo.com).'
				: 'Escribe tu correo para recibir el descuento.';
			return;
		}

		button.disabled = true;
		button.textContent = 'Enviando…';
		window.setTimeout(() => {
			form.dataset.state = 'ok';
			button.textContent = '¡Listo!';
			message.textContent = `Tu código BIENVENIDA10 va camino a ${value}.`;
		}, 900);
	});
}
