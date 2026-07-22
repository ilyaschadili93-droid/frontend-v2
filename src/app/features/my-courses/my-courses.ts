import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AppUser } from '../../core/models';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar';
import { SessionCardComponent } from '../../shared/components/session-card/session-card';
import { ProgressRingComponent } from '../../shared/components/progress-ring/progress-ring';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card';
import { CardSkeletonComponent } from '../../shared/components/card-skeleton/card-skeleton';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state';
import { listStagger } from '../../shared/animations/animations';

@Component({
  selector: 'app-my-courses',
  imports: [
    RouterLink, MatButtonModule, AvatarComponent, SessionCardComponent, ProgressRingComponent,
    StatCardComponent, CardSkeletonComponent, EmptyStateComponent, ErrorStateComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [listStagger],
  templateUrl: './my-courses.html',
  styleUrl: './my-courses.scss',
})
export class MyCoursesComponent {
  private readonly userService = inject(UserService);
  private readonly auth = inject(AuthService);

  readonly status = signal<'loading' | 'error' | 'ready'>('loading');
  readonly user = signal<AppUser | null>(null);

  readonly avgProgress = computed(() => {
    const s = this.user()?.sessions ?? [];
    if (!s.length) return 0;
    return Math.round(s.reduce((n, x) => n + x.progress, 0) / s.length);
  });
  readonly completed = computed(() => (this.user()?.sessions ?? []).filter((s) => s.progress >= 100).length);
  readonly inProgress = computed(() => (this.user()?.sessions ?? []).filter((s) => s.progress < 100).length);

  constructor() {
    this.load();
  }

  load(): void {
    const me = this.auth.currentUser();
    if (!me) {
      this.status.set('error');
      return;
    }
    this.status.set('loading');
    // Fetch fresh data (enrollments) for the signed-in learner.
    this.userService.getById(me.id).subscribe({
      next: (user) => {
        this.user.set(user);
        this.status.set('ready');
      },
      error: () => this.status.set('error'),
    });
  }
}
