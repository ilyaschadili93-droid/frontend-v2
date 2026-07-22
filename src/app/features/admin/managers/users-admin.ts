import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AppUser, UserInput } from '../../../core/models';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-users-admin',
  imports: [MatButtonModule, MatDialogModule, SkeletonComponent, ErrorStateComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mgr">
      <div class="mgr-head">
        <span class="count muted">{{ items().length }} users</span>
        <button mat-flat-button color="primary" (click)="openForm()"><span class="material-icons-round">add</span>&nbsp;New user</button>
      </div>

      @switch (status()) {
        @case ('loading') { <app-skeleton width="100%" height="220px" radius="12px" /> }
        @case ('error') { <app-error-state (retry)="load()" /> }
        @default {
          @if (items().length === 0) {
            <app-empty-state icon="people" title="No users" message="Create your first user." actionLabel="New user" (action)="openForm()" />
          } @else {
            <div class="admin-scroll">
              <table class="admin-table">
                <thead><tr><th>Username</th><th>Email</th><th>Role</th><th class="num">Sessions</th><th></th></tr></thead>
                <tbody>
                  @for (u of items(); track u.id) {
                    <tr>
                      <td><b>{{ u.userName }}</b></td>
                      <td>{{ u.email }}</td>
                      <td>@if (u.isAdmin) { <span class="role admin">Admin</span> } @else { <span class="role">Learner</span> }</td>
                      <td class="num">{{ u.sessions.length }}</td>
                      <td><div class="admin-actions">
                        <button class="icon-btn-sm" (click)="openForm(u)" title="Edit"><span class="material-icons-round">edit</span></button>
                        <button class="icon-btn-sm danger" (click)="remove(u)" title="Delete"><span class="material-icons-round">delete</span></button>
                      </div></td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        }
      }
    </div>
  `,
  styles: [`
    .mgr { padding: 12px; }
    .mgr-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
    .mgr-head button { display: inline-flex; align-items: center; }
    .role { font-size: 0.74rem; font-weight: 700; padding: 3px 10px; border-radius: 999px; background: var(--surface-2); color: var(--text-muted); }
    .role.admin { background: rgba(139, 92, 246, 0.16); color: #8b5cf6; }
  `],
})
export class UsersAdminComponent {
  private readonly service = inject(UserService);
  private readonly dialog = inject(MatDialog);
  private readonly notify = inject(NotificationService);

  readonly status = signal<'loading' | 'error' | 'ready'>('loading');
  readonly items = signal<AppUser[]>([]);

  constructor() { this.load(); }

  load(): void {
    this.status.set('loading');
    this.service.getAll().subscribe({
      next: (u) => { this.items.set(u); this.status.set('ready'); },
      error: () => this.status.set('error'),
    });
  }

  openForm(user?: AppUser): void {
    this.dialog.open(UserDialogComponent, { data: user ?? null })
      .afterClosed().subscribe((result: UserInput | undefined) => {
        if (!result) return;
        const op = user ? this.service.update(user.id, result) : this.service.create(result);
        op.subscribe({ next: () => { this.notify.success(user ? 'User updated' : 'User created'); this.load(); } });
      });
  }

  remove(user: AppUser): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete user', message: `Delete "${user.userName}"? They will be removed from all sessions.`, confirmText: 'Delete', danger: true },
    }).afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.service.delete(user.id).subscribe({ next: () => { this.notify.success('User deleted'); this.load(); } });
    });
  }
}

// ---------------- Dialog ----------------
@Component({
  selector: 'app-user-dialog',
  imports: [FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>{{ editing ? 'Edit user' : 'New user' }}</h2>
    <mat-dialog-content>
      <form class="dform">
        <mat-form-field appearance="outline"><mat-label>Username</mat-label><input matInput [(ngModel)]="model.userName" name="un" required /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Email</mat-label><input matInput type="email" [(ngModel)]="model.email" name="em" required /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Avatar URL (optional)</mat-label><input matInput [(ngModel)]="model.avatarUrl" name="av" /></mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" (click)="save()" [disabled]="!model.userName.trim() || !model.email.trim()">Save</button>
    </mat-dialog-actions>
  `,
})
export class UserDialogComponent {
  private readonly ref = inject<MatDialogRef<UserDialogComponent, UserInput>>(MatDialogRef);
  private readonly data = inject<AppUser | null>(MAT_DIALOG_DATA);
  readonly editing = !!this.data;
  model: { userName: string; email: string; avatarUrl: string } = {
    userName: this.data?.userName ?? '',
    email: this.data?.email ?? '',
    avatarUrl: this.data?.avatarUrl ?? '',
  };
  save(): void {
    if (!this.model.userName.trim() || !this.model.email.trim()) return;
    this.ref.close({ userName: this.model.userName, email: this.model.email, avatarUrl: this.model.avatarUrl || null });
  }
}
