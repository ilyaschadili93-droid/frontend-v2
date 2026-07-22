import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** A single shimmering placeholder block. */
@Component({
  selector: 'app-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="sk" [style.width]="width()" [style.height]="height()" [style.borderRadius]="radius()"></span>`,
  styles: [`
    .sk {
      display: block;
      position: relative;
      overflow: hidden;
      background: var(--skeleton-base);
    }
    .sk::after {
      content: '';
      position: absolute;
      inset: 0;
      transform: translateX(-100%);
      background: linear-gradient(90deg, transparent, var(--skeleton-shine), transparent);
      animation: skeleton-shimmer 1.5s infinite;
    }
  `],
})
export class SkeletonComponent {
  readonly width = input<string>('100%');
  readonly height = input<string>('1rem');
  readonly radius = input<string>('8px');
}
