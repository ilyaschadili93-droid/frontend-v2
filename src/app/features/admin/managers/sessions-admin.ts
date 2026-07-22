import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Formateur, Formation, Session, SessionInput } from '../../../core/models';
import { SessionService } from '../../../core/services/session.service';
import { FormationService } from '../../../core/services/formation.service';
import { FormateurService } from '../../../core/services/formateur.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';

interface SessionDialogData {
  session: Session | null;
  formations: Formation[];
  trainers: Formateur[];
}

@Component({
  selector: 'app-sessions-admin',
  imports: [DatePipe, MatButtonModule, MatDialogModule, SkeletonComponent, ErrorStateComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mgr">
      <div class="mgr-head">
        <span class="count muted">{{ items().length }} sessions</span>
        <button mat-flat-button color="primary" (click)="openForm()" [disabled]="formations().length === 0">
          <span class="material-icons-round">add</span>&nbsp;New session
        </button>
      </div>

      @switch (status()) {
        @case ('loading') { <app-skeleton width="100%" height="220px" radius="12px" /> }
        @case ('error') { <app-error-state (retry)="load()" /> }
        @default {
          @if (items().length === 0) {
            <app-empty-state icon="groups" title="No sessions" message="Create your first session." actionLabel="New session" (action)="openForm()" />
          } @else {
            <div class="admin-scroll">
              <table class="admin-table">
                <thead><tr><th>Title</th><th>Formation</th><th>Starts</th><th class="num">Progress</th><th class="num">Learners</th><th></th></tr></thead>
                <tbody>
                  @for (s of items(); track s.id) {
                    <tr>
                      <td><b>{{ s.title }}</b></td>
                      <td>{{ s.formationTitle }}</td>
                      <td>{{ s.startDate | date: 'mediumDate' }}</td>
                      <td class="num">{{ s.progress }}%</td>
                      <td class="num">{{ s.users.length }}</td>
                      <td><div class="admin-actions">
                        <button class="icon-btn-sm" (click)="openForm(s)" title="Edit"><span class="material-icons-round">edit</span></button>
                        <button class="icon-btn-sm danger" (click)="remove(s)" title="Delete"><span class="material-icons-round">delete</span></button>
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
  `],
})
export class SessionsAdminComponent {
  private readonly service = inject(SessionService);
  private readonly formationService = inject(FormationService);
  private readonly trainerService = inject(FormateurService);
  private readonly dialog = inject(MatDialog);
  private readonly notify = inject(NotificationService);

  readonly status = signal<'loading' | 'error' | 'ready'>('loading');
  readonly items = signal<Session[]>([]);
  readonly formations = signal<Formation[]>([]);
  readonly trainers = signal<Formateur[]>([]);

  constructor() { this.load(); }

  load(): void {
    this.status.set('loading');
    forkJoin({
      sessions: this.service.getAll(),
      formations: this.formationService.getAll(),
      trainers: this.trainerService.getAll(),
    }).subscribe({
      next: ({ sessions, formations, trainers }) => {
        this.items.set(sessions);
        this.formations.set(formations);
        this.trainers.set(trainers);
        this.status.set('ready');
      },
      error: () => this.status.set('error'),
    });
  }

  openForm(session?: Session): void {
    const data: SessionDialogData = { session: session ?? null, formations: this.formations(), trainers: this.trainers() };
    this.dialog.open(SessionDialogComponent, { data })
      .afterClosed().subscribe((result: SessionInput | undefined) => {
        if (!result) return;
        const op = session ? this.service.update(session.id, result) : this.service.create(result);
        op.subscribe({ next: () => { this.notify.success(session ? 'Session updated' : 'Session created'); this.load(); } });
      });
  }

  remove(session: Session): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete session', message: `Delete "${session.title}"?`, confirmText: 'Delete', danger: true },
    }).afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.service.delete(session.id).subscribe({ next: () => { this.notify.success('Session deleted'); this.load(); } });
    });
  }
}

// ---------------- Dialog ----------------
@Component({
  selector: 'app-session-dialog',
  imports: [FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>{{ editing ? 'Edit session' : 'New session' }}</h2>
    <mat-dialog-content>
      <form class="dform">
        <mat-form-field appearance="outline"><mat-label>Title</mat-label><input matInput [(ngModel)]="m.title" name="title" required /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Formation</mat-label>
          <mat-select [(ngModel)]="m.formationId" name="form" required (ngModelChange)="onFormationChange($event)">
            @for (f of data.formations; track f.id) { <mat-option [value]="f.id">{{ f.title }}</mat-option> }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline"><mat-label>AI trainer</mat-label>
          <mat-select [(ngModel)]="m.formateurId" name="tr">
            <mat-option [value]="null">— none —</mat-option>
            @for (t of data.trainers; track t.id) { <mat-option [value]="t.id">{{ t.name }}</mat-option> }
          </mat-select>
        </mat-form-field>
        <div class="row2">
          <mat-form-field appearance="outline"><mat-label>Start date</mat-label><input matInput type="date" [(ngModel)]="startDate" name="sd" /></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>End date</mat-label><input matInput type="date" [(ngModel)]="endDate" name="ed" /></mat-form-field>
        </div>
        <mat-form-field appearance="outline"><mat-label>Progress (%)</mat-label><input matInput type="number" min="0" max="100" [(ngModel)]="m.progress" name="prog" /></mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" (click)="save()" [disabled]="!m.title.trim() || !m.formationId">Save</button>
    </mat-dialog-actions>
  `,
})
export class SessionDialogComponent {
  private readonly ref = inject<MatDialogRef<SessionDialogComponent, SessionInput>>(MatDialogRef);
  readonly data = inject<SessionDialogData>(MAT_DIALOG_DATA);
  readonly editing = !!this.data.session;

  private readonly s = this.data.session;
  m = {
    title: this.s?.title ?? '',
    formationId: this.s?.formationId ?? (this.data.formations[0]?.id ?? ''),
    formateurId: (this.s?.formateurId ?? null) as string | null,
    progress: this.s?.progress ?? 0,
  };
  startDate = this.s?.startDate ? this.s.startDate.slice(0, 10) : '';
  endDate = this.s?.endDate ? this.s.endDate.slice(0, 10) : '';

  /** Default the trainer to the formation's trainer when picking a formation. */
  onFormationChange(id: string): void {
    if (this.m.formateurId) return;
    this.m.formateurId = this.data.formations.find((f) => f.id === id)?.formateurId ?? null;
  }

  save(): void {
    if (!this.m.title.trim() || !this.m.formationId) return;
    this.ref.close({
      title: this.m.title,
      formationId: this.m.formationId,
      formateurId: this.m.formateurId,
      startDate: this.startDate ? new Date(this.startDate).toISOString() : undefined,
      endDate: this.endDate ? new Date(this.endDate).toISOString() : undefined,
      progress: Math.min(100, Math.max(0, Number(this.m.progress) || 0)),
    });
  }
}
