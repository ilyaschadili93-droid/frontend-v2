import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Category, Difficulty, Formateur, Formation, FormationInput } from '../../../core/models';
import { FormationService } from '../../../core/services/formation.service';
import { CategoryService } from '../../../core/services/category.service';
import { FormateurService } from '../../../core/services/formateur.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';

interface FormationDialogData {
  formation: Formation | null;
  categories: Category[];
  trainers: Formateur[];
}

@Component({
  selector: 'app-formations-admin',
  imports: [MatButtonModule, MatDialogModule, SkeletonComponent, ErrorStateComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mgr">
      <div class="mgr-head">
        <span class="count muted">{{ items().length }} formations</span>
        <button mat-flat-button color="primary" (click)="openForm()" [disabled]="categories().length === 0">
          <span class="material-icons-round">add</span>&nbsp;New formation
        </button>
      </div>

      @switch (status()) {
        @case ('loading') { <app-skeleton width="100%" height="220px" radius="12px" /> }
        @case ('error') { <app-error-state (retry)="load()" /> }
        @default {
          @if (items().length === 0) {
            <app-empty-state icon="menu_book" title="No formations" message="Create your first formation." actionLabel="New formation" (action)="openForm()" />
          } @else {
            <div class="admin-scroll">
              <table class="admin-table">
                <thead><tr><th>Title</th><th>Category</th><th>Trainer</th><th>Difficulty</th><th class="num">Hours</th><th></th></tr></thead>
                <tbody>
                  @for (f of items(); track f.id) {
                    <tr>
                      <td><b>{{ f.title }}</b></td>
                      <td>{{ f.categorie?.name || '—' }}</td>
                      <td>{{ f.formateur?.name || '—' }}</td>
                      <td><span class="chip" [class]="diffClass(f.difficulty)">{{ f.difficulty }}</span></td>
                      <td class="num">{{ f.durationHours }}</td>
                      <td><div class="admin-actions">
                        <button class="icon-btn-sm" (click)="openForm(f)" title="Edit"><span class="material-icons-round">edit</span></button>
                        <button class="icon-btn-sm danger" (click)="remove(f)" title="Delete"><span class="material-icons-round">delete</span></button>
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
export class FormationsAdminComponent {
  private readonly service = inject(FormationService);
  private readonly categoryService = inject(CategoryService);
  private readonly trainerService = inject(FormateurService);
  private readonly dialog = inject(MatDialog);
  private readonly notify = inject(NotificationService);

  readonly status = signal<'loading' | 'error' | 'ready'>('loading');
  readonly items = signal<Formation[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly trainers = signal<Formateur[]>([]);

  constructor() { this.load(); }

  load(): void {
    this.status.set('loading');
    forkJoin({
      formations: this.service.getAll(),
      categories: this.categoryService.getAll(),
      trainers: this.trainerService.getAll(),
    }).subscribe({
      next: ({ formations, categories, trainers }) => {
        this.items.set(formations);
        this.categories.set(categories);
        this.trainers.set(trainers);
        this.status.set('ready');
      },
      error: () => this.status.set('error'),
    });
  }

  diffClass(d: string): string {
    return d === 'Advanced' ? 'badge-advanced' : d === 'Intermediate' ? 'badge-intermediate' : 'badge-beginner';
  }

  openForm(formation?: Formation): void {
    const data: FormationDialogData = { formation: formation ?? null, categories: this.categories(), trainers: this.trainers() };
    this.dialog.open(FormationDialogComponent, { data })
      .afterClosed().subscribe((result: FormationInput | undefined) => {
        if (!result) return;
        const op = formation ? this.service.update(formation.id, result) : this.service.create(result);
        op.subscribe({ next: () => { this.notify.success(formation ? 'Formation updated' : 'Formation created'); this.load(); } });
      });
  }

  remove(formation: Formation): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete formation', message: `Delete "${formation.title}"? Its sessions will also be removed.`, confirmText: 'Delete', danger: true },
    }).afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.service.delete(formation.id).subscribe({ next: () => { this.notify.success('Formation deleted'); this.load(); } });
    });
  }
}

// ---------------- Dialog ----------------
@Component({
  selector: 'app-formation-dialog',
  imports: [FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>{{ editing ? 'Edit formation' : 'New formation' }}</h2>
    <mat-dialog-content>
      <form class="dform">
        <mat-form-field appearance="outline"><mat-label>Title</mat-label><input matInput [(ngModel)]="m.title" name="title" required /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Description</mat-label><textarea matInput rows="2" [(ngModel)]="m.description" name="desc"></textarea></mat-form-field>
        <div class="row2">
          <mat-form-field appearance="outline"><mat-label>Category</mat-label>
            <mat-select [(ngModel)]="m.categorieId" name="cat" required>
              @for (c of data.categories; track c.id) { <mat-option [value]="c.id">{{ c.name }}</mat-option> }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline"><mat-label>AI trainer</mat-label>
            <mat-select [(ngModel)]="m.formateurId" name="tr">
              <mat-option [value]="null">— none —</mat-option>
              @for (t of data.trainers; track t.id) { <mat-option [value]="t.id">{{ t.name }}</mat-option> }
            </mat-select>
          </mat-form-field>
        </div>
        <div class="row2">
          <mat-form-field appearance="outline"><mat-label>Difficulty</mat-label>
            <mat-select [(ngModel)]="m.difficulty" name="diff">
              <mat-option value="Beginner">Beginner</mat-option>
              <mat-option value="Intermediate">Intermediate</mat-option>
              <mat-option value="Advanced">Advanced</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Duration (hours)</mat-label><input matInput type="number" min="0" [(ngModel)]="m.durationHours" name="hrs" /></mat-form-field>
        </div>
        <mat-form-field appearance="outline"><mat-label>Objectives (comma-separated)</mat-label><input matInput [(ngModel)]="objectives" name="obj" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Technologies (comma-separated)</mat-label><input matInput [(ngModel)]="technologies" name="tech" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Prerequisites (comma-separated)</mat-label><input matInput [(ngModel)]="prerequisites" name="pre" /></mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" (click)="save()" [disabled]="!m.title.trim() || !m.categorieId">Save</button>
    </mat-dialog-actions>
  `,
})
export class FormationDialogComponent {
  private readonly ref = inject<MatDialogRef<FormationDialogComponent, FormationInput>>(MatDialogRef);
  readonly data = inject<FormationDialogData>(MAT_DIALOG_DATA);
  readonly editing = !!this.data.formation;

  private readonly f = this.data.formation;
  m = {
    title: this.f?.title ?? '',
    description: this.f?.description ?? '',
    difficulty: (this.f?.difficulty ?? 'Beginner') as Difficulty,
    durationHours: this.f?.durationHours ?? 8,
    categorieId: this.f?.categorieId ?? (this.data.categories[0]?.id ?? ''),
    formateurId: (this.f?.formateurId ?? null) as string | null,
  };
  objectives = (this.f?.objectives ?? []).join(', ');
  technologies = (this.f?.technologies ?? []).join(', ');
  prerequisites = (this.f?.prerequisites ?? []).join(', ');

  private toList(v: string): string[] {
    return v.split(',').map((s) => s.trim()).filter(Boolean);
  }

  save(): void {
    if (!this.m.title.trim() || !this.m.categorieId) return;
    this.ref.close({
      title: this.m.title,
      description: this.m.description,
      difficulty: this.m.difficulty,
      durationHours: Number(this.m.durationHours) || 0,
      categorieId: this.m.categorieId,
      formateurId: this.m.formateurId,
      objectives: this.toList(this.objectives),
      technologies: this.toList(this.technologies),
      prerequisites: this.toList(this.prerequisites),
    });
  }
}
