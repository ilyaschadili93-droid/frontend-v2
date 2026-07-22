import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Session, SessionSummary } from '../../../core/models';

@Component({
  selector: 'app-session-card',
  imports: [RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="card surface-card" [routerLink]="['/sessions', session().id]">
      <div class="top">
        <h3>{{ session().title }}</h3>
        <span class="pct">{{ session().progress }}%</span>
      </div>
      <div class="bar"><span [style.width.%]="session().progress"></span></div>
      <div class="foot">
        <span class="meta"><span class="material-icons-round">event</span>{{ session().startDate | date: 'MMM d' }}</span>
        <span class="meta"><span class="material-icons-round">groups</span>{{ userCount() }} learners</span>
      </div>
    </a>
  `,
  styles: [`
    .card {
      display: flex; flex-direction: column; gap: 12px; padding: 18px;
      transition: transform 0.3s var(--ease-out), box-shadow 0.3s var(--ease-out);
    }
    .card:hover { transform: translate(-4px, -4px); box-shadow: var(--shadow-lg); }
    .top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
    h3 { font-size: 1.02rem; }
    .pct { font-family: var(--font-mono); font-weight: 700; color: var(--ink); }
    .bar { height: 12px; border-radius: 999px; background: var(--surface-3); border: 2px solid var(--ink); overflow: hidden; }
    .bar span {
      display: block; height: 100%;
      background: var(--primary);
      transition: width 0.8s var(--ease-out);
    }
    .foot { display: flex; gap: 16px; }
    .meta { display: inline-flex; align-items: center; gap: 5px; font-size: 0.82rem; font-weight: 600; color: var(--text-muted); }
    .meta .material-icons-round { font-size: 16px; }
  `],
})
export class SessionCardComponent {
  readonly session = input.required<Session | SessionSummary>();
  userCount(): number {
    const s = this.session();
    return 'users' in s ? s.users.length : s.userCount;
  }
}
