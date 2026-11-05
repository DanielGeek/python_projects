import { pulse } from '../utils/motion';
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
			pulse(input, [
				{ transform: 'translateX(0)' },
				{ transform: 'translateX(-6px)' },
				{ transform: 'translateX(5px)' },
				{ transform: 'translateX(-3px)' },
				{ transform: 'translateX(0)' },
			], { duration: 360 });
			pulse(message, [
				{ opacity: 0, transform: 'translateY(-3px)' },
				{ opacity: 1, transform: 'translateY(0)' },
			], { duration: 240 });
			return;
		}

		button.disabled = true;
		button.textContent = 'Enviando…';
		window.setTimeout(() => {
			form.dataset.state = 'ok';
			button.textContent = '¡Listo!';
			message.textContent = `Tu código BIENVENIDA10 va camino a ${value}.`;
				pulse(message, [
					{ opacity: 0, transform: 'translateY(4px)' },
					{ opacity: 1, transform: 'translateY(0)' },
				], { duration: 320 });
		}, 900);
	});
}
