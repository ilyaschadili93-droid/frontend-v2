import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { InitialsPipe } from '../../pipes/initials.pipe';
import { gradientFor } from '../../../core/utils/ui.util';

/** Circular avatar showing an image, or initials on a deterministic gradient. */
@Component({
  selector: 'app-avatar',
  imports: [InitialsPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="avatar"
      [style.width.px]="size()"
      [style.height.px]="size()"
      [style.fontSize.px]="size() * 0.38"
      [style.background]="imageUrl() ? null : gradient()"
    >
      @if (imageUrl()) {
        <img [src]="imageUrl()" [alt]="name()" />
      } @else {
        <span>{{ name() | initials }}</span>
      }
      @if (badge()) {
        <span class="badge" [title]="badge()"><span class="material-icons-round">{{ badge() }}</span></span>
      }
    </div>
  `,
  styles: [`
    .avatar {
      position: relative;
      border-radius: 50%;
      display: grid;
      place-items: center;
      color: #16130f;
      font-weight: 700;
      font-family: var(--font-display);
      border: 2px solid var(--ink);
      box-shadow: var(--shadow-sm);
      overflow: visible;
      flex-shrink: 0;
    }
    img {
      width: 100%; height: 100%;
      object-fit: cover; border-radius: 50%;
    }
    .badge {
      position: absolute;
      right: -3px; bottom: -3px;
      width: 44%; height: 44%;
      min-width: 16px; min-height: 16px;
      border-radius: 50%;
      background: var(--yellow);
      display: grid; place-items: center;
      border: 2px solid var(--ink);
    }
    .badge .material-icons-round { font-size: 0.7em; color: #16130f; }
  `],
})
export class AvatarComponent {
  readonly name = input.required<string>();
  readonly size = input<number>(48);
  readonly imageUrl = input<string | null | undefined>(null);
  /** Optional material icon rendered as a small corner badge (e.g. 'smart_toy'). */
  readonly badge = input<string | null>(null);

  readonly gradient = computed(() => gradientFor(this.name()));
}
