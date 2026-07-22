import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Compact stat tile: icon + value + label. */
@Component({
  selector: 'app-stat-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stat glass">
      <div class="ic" [style.background]="accent()"><span class="material-icons-round">{{ icon() }}</span></div>
      <div class="body">
        <span class="value">{{ value() }}</span>
        <span class="label muted">{{ label() }}</span>
      </div>
    </div>
  `,
  styles: [`
    .stat {
      display: flex; align-items: center; gap: 14px;
      padding: 18px 20px; border-radius: var(--radius);
    }
    .ic {
      width: 48px; height: 48px; border-radius: 12px;
      display: grid; place-items: center; color: #16130f; flex-shrink: 0;
      background: var(--yellow); border: 2px solid var(--ink); box-shadow: var(--shadow-sm);
    }
    .ic .material-icons-round { font-size: 24px; }
    .body { display: flex; flex-direction: column; }
    .value { font-family: var(--font-display); font-weight: 700; font-size: 1.8rem; line-height: 1.1; letter-spacing: -0.02em; }
    .label { font-family: var(--font-mono); font-size: 0.76rem; }
  `],
})
export class StatCardComponent {
  readonly icon = input.required<string>();
  readonly value = input.required<string | number>();
  readonly label = input.required<string>();
  readonly accent = input<string>('var(--gradient-brand)');
}
