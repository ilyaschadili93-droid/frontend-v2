import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { forkJoin, of } from 'rxjs';
import { AppUser, Session } from '../../../core/models';
import { SessionService } from '../../../core/services/session.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ProgressRingComponent } from '../../../shared/components/progress-ring/progress-ring';
import { AvatarComponent } from '../../../shared/components/avatar/avatar';
import { AiTrainerPanelComponent } from '../../../shared/components/ai-trainer-panel/ai-trainer-panel';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state';
import { enterAnimation, listStagger } from '../../../shared/animations/animations';

@Component({
  selector: 'app-session-detail',
  imports: [
    DatePipe, RouterLink, MatButtonModule, MatMenuModule, ProgressRingComponent,
    AvatarComponent, AiTrainerPanelComponent, SkeletonComponent, ErrorStateComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [enterAnimation, listStagger],
  templateUrl: './session-detail.html',
  styleUrl: './session-detail.scss',
})
export class SessionDetailComponent {
  private readonly sessionService = inject(SessionService);
  private readonly userService = inject(UserService);
  private readonly auth = inject(AuthService);
  private readonly notify = inject(NotificationService);

  readonly id = input.required<string>();
  readonly isAdmin = this.auth.isAdmin;

  readonly status = signal<'loading' | 'error' | 'ready'>('loading');
  readonly session = signal<Session | null>(null);
  readonly allUsers = signal<AppUser[]>([]);

  /** Users not yet enrolled in this session. */
  readonly availableUsers = computed(() => {
    const s = this.session();
    if (!s) return [];
    const enrolled = new Set(s.users.map((u) => u.id));
    return this.allUsers().filter((u) => !enrolled.has(u.id));
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) this.load(id);
    });
  }

  load(id = this.id()): void {
    this.status.set('loading');
    // The user roster (for enrolment) is admin-only; skip it for learners.
    const users$ = this.auth.isAdmin() ? this.userService.getAll() : of<AppUser[]>([]);
    forkJoin({
      session: this.sessionService.getById(id),
      users: users$,
    }).subscribe({
      next: ({ session, users }) => {
        this.session.set(session);
        this.allUsers.set(users);
        this.status.set('ready');
      },
      error: () => this.status.set('error'),
    });
  }

  enroll(user: AppUser): void {
    const s = this.session();
    if (!s) return;
    this.sessionService.addUser(s.id, user.id).subscribe({
      next: () => {
        this.notify.success(`${user.userName} enrolled in ${s.title}`);
        this.load(s.id);
      },
    });
  }

  remove(userId: string, userName: string): void {
    const s = this.session();
    if (!s) return;
    this.sessionService.removeUser(s.id, userId).subscribe({
      next: () => {
        this.notify.info(`${userName} removed from ${s.title}`);
        this.load(s.id);
      },
    });
  }
}
