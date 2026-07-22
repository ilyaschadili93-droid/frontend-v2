import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Formateur, FormateurInput } from '../../../core/models';
import { FormateurService } from '../../../core/services/formateur.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-trainers-admin',
  imports: [MatButtonModule, MatDialogModule, SkeletonComponent, ErrorStateComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mgr">
      <div class="mgr-head">
        <span class="count muted">{{ items().length }} AI trainers</span>
        <button mat-flat-button color="primary" (click)="openForm()"><span class="material-icons-round">add</span>&nbsp;New trainer</button>
      </div>

      @switch (status()) {
        @case ('loading') { <app-skeleton width="100%" height="220px" radius="12px" /> }
        @case ('error') { <app-error-state (retry)="load()" /> }
        @default {
          @if (items().length === 0) {
            <app-empty-state icon="smart_toy" title="No AI trainers" message="Create your first AI trainer." actionLabel="New trainer" (action)="openForm()" />
          } @else {
            <div class="admin-scroll">
              <table class="admin-table">
                <thead><tr><th>Name</th><th>Avatar model</th><th>Voice</th><th class="num">Courses</th><th></th></tr></thead>
                <tbody>
                  @for (t of items(); track t.id) {
                    <tr>
                      <td><b>{{ t.name }}</b><br /><span class="muted sub">{{ t.expertise }}</span></td>
                      <td>{{ t.avatarModel || '—' }}</td>
                      <td>{{ t.voiceId || '—' }}</td>
                      <td class="num">{{ t.formations.length }}</td>
                      <td><div class="admin-actions">
                        <button class="icon-btn-sm" (click)="openForm(t)" title="Edit"><span class="material-icons-round">edit</span></button>
                        <button class="icon-btn-sm danger" (click)="remove(t)" title="Delete"><span class="material-icons-round">delete</span></button>
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
    .sub { font-size: 0.8rem; }
  `],
})
export class TrainersAdminComponent {
  private readonly service = inject(FormateurService);
  private readonly dialog = inject(MatDialog);
  private readonly notify = inject(NotificationService);

  readonly status = signal<'loading' | 'error' | 'ready'>('loading');
  readonly items = signal<Formateur[]>([]);

  constructor() { this.load(); }

  load(): void {
    this.status.set('loading');
    this.service.getAll().subscribe({
      next: (t) => { this.items.set(t); this.status.set('ready'); },
      error: () => this.status.set('error'),
    });
  }

  openForm(trainer?: Formateur): void {
    this.dialog.open(TrainerDialogComponent, { data: trainer ?? null })
      .afterClosed().subscribe((result: FormateurInput | undefined) => {
        if (!result) return;
        const op = trainer ? this.service.update(trainer.id, result) : this.service.create(result);
        op.subscribe({ next: () => { this.notify.success(trainer ? 'Trainer updated' : 'Trainer created'); this.load(); } });
      });
  }

  remove(trainer: Formateur): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete trainer', message: `Delete "${trainer.name}"? Their formations will be unassigned.`, confirmText: 'Delete', danger: true },
    }).afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.service.delete(trainer.id).subscribe({ next: () => { this.notify.success('Trainer deleted'); this.load(); } });
    });
  }
}

// ---------------- Dialog ----------------
@Component({
  selector: 'app-trainer-dialog',
  imports: [FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>{{ editing ? 'Edit AI trainer' : 'New AI trainer' }}</h2>
    <mat-dialog-content>
      <form class="dform">
        <mat-form-field appearance="outline"><mat-label>Name</mat-label><input matInput [(ngModel)]="model.name" name="name" required /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Bio</mat-label><textarea matInput rows="2" [(ngModel)]="model.bio" name="bio"></textarea></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Expertise (comma-separated)</mat-label><input matInput [(ngModel)]="model.expertise" name="exp" placeholder="C#,.NET,OOP" /></mat-form-field>
        <div class="row2">
          <mat-form-field appearance="outline"><mat-label>Anam avatar ID</mat-label><input matInput [(ngModel)]="model.avatarId" name="aid" /></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Avatar model</mat-label><input matInput [(ngModel)]="model.avatarModel" name="amodel" placeholder="cara-4" /></mat-form-field>
        </div>
        <div class="row2">
          <mat-form-field appearance="outline"><mat-label>Voice ID</mat-label><input matInput [(ngModel)]="model.voiceId" name="vid" /></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>LLM ID</mat-label><input matInput [(ngModel)]="model.llmId" name="lid" /></mat-form-field>
        </div>
        <mat-form-field appearance="outline"><mat-label>Avatar video URL (fallback demo)</mat-label><input matInput [(ngModel)]="model.avatarVideoUrl" name="vurl" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>System prompt</mat-label><textarea matInput rows="3" [(ngModel)]="model.systemPrompt" name="sp"></textarea></mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" (click)="save()" [disabled]="!model.name.trim()">Save</button>
    </mat-dialog-actions>
  `,
})
export class TrainerDialogComponent {
  private readonly ref = inject<MatDialogRef<TrainerDialogComponent, FormateurInput>>(MatDialogRef);
  private readonly data = inject<Formateur | null>(MAT_DIALOG_DATA);
  readonly editing = !!this.data;
  model: Required<FormateurInput> = {
    name: this.data?.name ?? '',
    bio: this.data?.bio ?? '',
    expertise: this.data?.expertise ?? '',
    avatarId: this.data?.avatarId ?? '',
    avatarModel: this.data?.avatarModel ?? 'cara-4',
    voiceId: this.data?.voiceId ?? '',
    llmId: this.data?.llmId ?? 'a7cf662c-2ace-4de1-a21e-ef0fbf144bb7',
    systemPrompt: this.data?.systemPrompt ?? '',
    avatarVideoUrl: this.data?.avatarVideoUrl ?? '',
  };
  save(): void {
    if (!this.model.name.trim()) return;
    this.ref.close(this.model);
  }
}
