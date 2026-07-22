import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { enterAnimation } from '../../shared/animations/animations';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [enterAnimation],
  template: `
    <section class="wrap container" @enter>
      <div class="code gradient-text">404</div>
      <h1>Page not found</h1>
      <p class="muted">The page you're looking for doesn't exist or has moved.</p>
      <div class="actions">
        <a mat-flat-button color="primary" routerLink="/home"><span class="material-icons-round">home</span>&nbsp;Back home</a>
        <a mat-stroked-button routerLink="/categories">Explore categories</a>
      </div>
    </section>
  `,
  styles: [`
    .wrap {
      min-height: calc(100vh - 68px);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      text-align: center; gap: 12px;
    }
    .code { font-family: var(--font-display); font-size: clamp(6rem, 20vw, 12rem); font-weight: 800; line-height: 1; }
    h1 { font-size: 2rem; }
    p { font-size: 1.05rem; }
    .actions { display: flex; gap: 12px; margin-top: 16px; flex-wrap: wrap; justify-content: center; }
    .actions a { display: inline-flex; align-items: center; }
  `],
})
export class NotFoundComponent {}
