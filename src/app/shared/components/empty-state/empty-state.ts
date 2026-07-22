import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { scaleIn } from '../../animations/animations';

/** Friendly empty state with an icon, message and optional action button. */
@Component({
  selector: 'app-empty-state',
  imports: [MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [scaleIn],
  template: `
    <div class="empty" @scaleIn>
      <div class="orb"><span class="material-icons-round">{{ icon() }}</span></div>
      <h3>{{ title() }}</h3>
      <p class="muted">{{ message() }}</p>
      @if (actionLabel()) {
        <button mat-flat-button color="primary" (click)="action.emit()">{{ actionLabel() }}</button>
      }
    </div>
  `,
  styles: [`
    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 12px;
      padding: 56px 24px;
    }
    .orb {
      width: 84px; height: 84px;
      border-radius: 18px;
      display: grid; place-items: center;
      background: var(--yellow);
      border: var(--bw) solid var(--ink);
      box-shadow: var(--shadow);
      margin-bottom: 10px;
    }
    .orb .material-icons-round { font-size: 40px; color: #16130f; }
    h3 { font-size: 1.25rem; }
    p { max-width: 380px; margin: 0; }
    button { margin-top: 8px; }
  `],
})
export class EmptyStateComponent {
  readonly icon = input<string>('inbox');
  readonly title = input<string>('Nothing here yet');
  readonly message = input<string>('There is no data to display.');
  readonly actionLabel = input<string | null>(null);
  readonly action = output<void>();
}
