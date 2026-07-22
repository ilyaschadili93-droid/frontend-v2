import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { scaleIn } from '../../animations/animations';

/** Error state with a retry action. */
@Component({
  selector: 'app-error-state',
  imports: [MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [scaleIn],
  template: `
    <div class="error" @scaleIn>
      <div class="orb"><span class="material-icons-round">error_outline</span></div>
      <h3>{{ title() }}</h3>
      <p class="muted">{{ message() }}</p>
      <button mat-stroked-button (click)="retry.emit()">
        <span class="material-icons-round">refresh</span>&nbsp;Try again
      </button>
    </div>
  `,
  styles: [`
    .error {
      display: flex; flex-direction: column; align-items: center;
      text-align: center; gap: 12px; padding: 56px 24px;
    }
    .orb {
      width: 84px; height: 84px; border-radius: 18px;
      display: grid; place-items: center;
      background: var(--coral);
      border: var(--bw) solid var(--ink);
      box-shadow: var(--shadow);
      margin-bottom: 10px;
    }
    .orb .material-icons-round { font-size: 40px; color: #16130f; }
    h3 { font-size: 1.25rem; }
    p { max-width: 380px; margin: 0; }
    button { margin-top: 8px; display: inline-flex; align-items: center; }
    button .material-icons-round { font-size: 18px; }
  `],
})
export class ErrorStateComponent {
  readonly title = input<string>('Something went wrong');
  readonly message = input<string>('We could not load this content. Please try again.');
  readonly retry = output<void>();
}
