import {
  animate,
  animateChild,
  animation,
  query,
  stagger,
  style,
  transition,
  trigger,
  useAnimation,
} from '@angular/animations';

/** Reusable fade + rise animation. */
export const fadeInUp = animation([
  style({ opacity: 0, transform: 'translateY({{ y }}px)' }),
  animate('{{ duration }} {{ delay }} cubic-bezier(0.22,1,0.36,1)', style({ opacity: 1, transform: 'none' })),
]);

/** Fade/rise a single element on enter. */
export const enterAnimation = trigger('enter', [
  transition(':enter', [useAnimation(fadeInUp, { params: { y: 18, duration: '500ms', delay: '0ms' } })]),
]);

/** Stagger children of a list/grid on enter. Add @listStagger to the container
 *  and mark each child with a trigger, or rely on query(':enter'). */
export const listStagger = trigger('listStagger', [
  transition('* => *', [
    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'translateY(22px) scale(0.98)' }),
        stagger(70, [
          animate('520ms cubic-bezier(0.22,1,0.36,1)', style({ opacity: 1, transform: 'none' })),
        ]),
      ],
      { optional: true },
    ),
  ]),
]);

/** Simple fade for route content (works alongside view transitions). */
export const routeFade = trigger('routeFade', [
  transition('* <=> *', [
    style({ opacity: 0, transform: 'translateY(10px)' }),
    animate('380ms 40ms cubic-bezier(0.22,1,0.36,1)', style({ opacity: 1, transform: 'none' })),
    query('@*', animateChild(), { optional: true }),
  ]),
]);

/** Scale-in for dialogs / panels. */
export const scaleIn = trigger('scaleIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.94)' }),
    animate('260ms cubic-bezier(0.22,1,0.36,1)', style({ opacity: 1, transform: 'none' })),
  ]),
]);
