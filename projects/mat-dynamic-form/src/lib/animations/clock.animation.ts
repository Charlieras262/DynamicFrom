import { trigger, transition, style, animate } from '@angular/animations';

export const fadeScaleAnimation = trigger('fadeScale', [
  // Animación de entrada
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(1.2)' }),
    animate(
      '300ms ease-out',
      style({ opacity: 1, transform: 'scale(1)' })
    ),
  ]),

  // Animación de salida
  transition(':leave', [
    style({ opacity: 1, transform: 'scale(1)' }),
    animate(
      '250ms ease-in',
      style({ opacity: 0, transform: 'scale(0.8)' })
    ),
  ]),
]);

export const fadeTransform = trigger('fadeTransform', [
  // Animación de entrada
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(10px)' }),
    animate(
      '300ms ease-out',
      style({ opacity: 1, transform: 'translateY(0)' })
    ),
  ]),

  // Animación de salida
  transition(':leave', [
    style({ opacity: 1, transform: 'translateY(0)' }),
    animate(
      '300ms ease-in',
      style({ opacity: 0, transform: 'translateY(10px)' })
    ),
  ]),
]);