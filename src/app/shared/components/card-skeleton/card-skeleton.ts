import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SkeletonComponent } from '../skeleton/skeleton';

/** A responsive grid of card-shaped skeletons for list pages. */
@Component({
  selector: 'app-card-skeleton',
  imports: [SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid">
      @for (i of items(); track i) {
        <div class="card surface-card">
          <app-skeleton width="100%" height="140px" radius="14px" />
          <app-skeleton width="40%" height="0.8rem" radius="6px" />
          <app-skeleton width="85%" height="1.2rem" radius="6px" />
          <app-skeleton width="100%" height="0.8rem" radius="6px" />
          <app-skeleton width="70%" height="0.8rem" radius="6px" />
          <div class="foot">
            <app-skeleton width="90px" height="1.6rem" radius="999px" />
            <app-skeleton width="60px" height="1.6rem" radius="999px" />
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 22px;
    }
    .card {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .foot { display: flex; gap: 10px; margin-top: 4px; }
  `],
})
export class CardSkeletonComponent {
  readonly count = input<number>(6);
  items() {
    return Array.from({ length: this.count() }, (_, i) => i);
  }
}
