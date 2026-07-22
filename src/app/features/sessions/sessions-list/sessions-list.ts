import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Session } from '../../../core/models';
import { SessionService } from '../../../core/services/session.service';
import { SessionCardComponent } from '../../../shared/components/session-card/session-card';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card';
import { CardSkeletonComponent } from '../../../shared/components/card-skeleton/card-skeleton';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state';
import { listStagger } from '../../../shared/animations/animations';

@Component({
  selector: 'app-sessions-list',
  imports: [
    SessionCardComponent, StatCardComponent, CardSkeletonComponent,
    EmptyStateComponent, ErrorStateComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [listStagger],
  template: `
    <section class="container section-pad">
      <header class="page-head">
        <span class="eyebrow gradient-text">Live classrooms</span>
        <h1>Learning <span class="gradient-text">Sessions</span></h1>
        <p class="muted">Track progress across every running session, like classes in session.</p>
      </header>

      @switch (status()) {
        @case ('loading') { <app-card-skeleton [count]="6" /> }
        @case ('error') { <app-error-state (retry)="load()" /> }
        @default {
          @if (sessions().length === 0) {
            <app-empty-state icon="groups" title="No sessions yet"
              message="Sessions will appear here once they are scheduled." />
          } @else {
            <div class="stats">
              <app-stat-card icon="groups" [value]="sessions().length" label="Active sessions" />
              <app-stat-card icon="trending_up" [value]="avgProgress() + '%'" label="Average progress" accent="var(--gradient-cool)" />
              <app-stat-card icon="school" [value]="totalLearners()" label="Enrolled learners" accent="var(--gradient-warm)" />
            </div>
            <div class="grid" [@listStagger]="sessions().length">
              @for (s of sessions(); track s.id) {
                <app-session-card [session]="s" />
              }
            </div>
          }
        }
      }
    </section>
  `,
  styleUrl: './sessions-list.scss',
})
export class SessionsListComponent {
  private readonly sessionService = inject(SessionService);

  readonly status = signal<'loading' | 'error' | 'ready'>('loading');
  readonly sessions = signal<Session[]>([]);

  readonly avgProgress = computed(() => {
    const s = this.sessions();
    if (!s.length) return 0;
    return Math.round(s.reduce((n, x) => n + x.progress, 0) / s.length);
  });
  readonly totalLearners = computed(() =>
    this.sessions().reduce((n, s) => n + (s.users?.length ?? 0), 0),
  );

  constructor() {
    this.load();
  }

  load(): void {
    this.status.set('loading');
    this.sessionService.getAll().subscribe({
      next: (s) => {
        this.sessions.set(s);
        this.status.set('ready');
      },
      error: () => this.status.set('error'),
    });
  }
}
