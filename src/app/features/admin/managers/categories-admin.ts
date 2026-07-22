import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Category, CategoryInput } from '../../../core/models';
import { CategoryService } from '../../../core/services/category.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-categories-admin',
  imports: [MatButtonModule, MatDialogModule, SkeletonComponent, ErrorStateComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mgr">
      <div class="mgr-head">
        <span class="count muted">{{ items().length }} categories</span>
        <button mat-flat-button color="primary" (click)="openForm()">
          <span class="material-icons-round">add</span>&nbsp;New category
        </button>
      </div>

      @switch (status()) {
        @case ('loading') { <app-skeleton width="100%" height="220px" radius="12px" /> }
        @case ('error') { <app-error-state (retry)="load()" /> }
        @default {
          @if (items().length === 0) {
            <app-empty-state icon="category" title="No categories" message="Create your first category." actionLabel="New category" (action)="openForm()" />
          } @else {
            <div class="admin-scroll">
              <table class="admin-table">
                <thead><tr><th>Name</th><th>Icon</th><th>Color</th><th class="num">Formations</th><th></th></tr></thead>
                <tbody>
                  @for (c of items(); track c.id) {
                    <tr>
                      <td><b>{{ c.name }}</b><br /><span class="muted sub">{{ c.description }}</span></td>
                      <td><span class="material-icons-round">{{ c.icon }}</span></td>
                      <td><span class="swatch" [style.background]="c.colorHex"></span>{{ c.colorHex }}</td>
                      <td class="num">{{ c.formationCount }}</td>
                      <td>
                        <div class="admin-actions">
                          <button class="icon-btn-sm" (click)="openForm(c)" title="Edit"><span class="material-icons-round">edit</span></button>
                          <button class="icon-btn-sm danger" (click)="remove(c)" title="Delete"><span class="material-icons-round">delete</span></button>
                        </div>
                      </td>
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
    .swatch { display: inline-block; width: 14px; height: 14px; border-radius: 4px; margin-right: 8px; vertical-align: middle; border: 1px solid var(--border); }
  `],
})
export class CategoriesAdminComponent {
  private readonly service = inject(CategoryService);
  private readonly dialog = inject(MatDialog);
  private readonly notify = inject(NotificationService);

  readonly status = signal<'loading' | 'error' | 'ready'>('loading');
  readonly items = signal<Category[]>([]);

  constructor() { this.load(); }

  load(): void {
    this.status.set('loading');
    this.service.getAll().subscribe({
      next: (c) => { this.items.set(c); this.status.set('ready'); },
      error: () => this.status.set('error'),
    });
  }

  openForm(category?: Category): void {
    this.dialog.open(CategoryDialogComponent, { data: category ?? null })
      .afterClosed().subscribe((result: CategoryInput | undefined) => {
        if (!result) return;
        const op = category
          ? this.service.update(category.id, result)
          : this.service.create(result);
        op.subscribe({
          next: () => { this.notify.success(category ? 'Category updated' : 'Category created'); this.load(); },
        });
      });
  }

  remove(category: Category): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete category', message: `Delete "${category.name}"? Its formations will also be removed.`, confirmText: 'Delete', danger: true },
    }).afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.service.delete(category.id).subscribe({
        next: () => { this.notify.success('Category deleted'); this.load(); },
      });
    });
  }
}

// ---------------- Dialog ----------------
@Component({
  selector: 'app-category-dialog',
  imports: [FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>{{ editing ? 'Edit category' : 'New category' }}</h2>
    <mat-dialog-content>
      <form class="dform">
        <mat-form-field appearance="outline"><mat-label>Name</mat-label><input matInput [(ngModel)]="model.name" name="name" required /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Description</mat-label><textarea matInput rows="2" [(ngModel)]="model.description" name="desc"></textarea></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Icon (Material icon name)</mat-label><input matInput [(ngModel)]="model.icon" name="icon" placeholder="code" /></mat-form-field>
        <div class="color-field">
          <input type="color" [(ngModel)]="model.colorHex" name="color" />
          <label>Accent color · {{ model.colorHex }}</label>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" (click)="save()" [disabled]="!model.name.trim()">Save</button>
    </mat-dialog-actions>
  `,
})
export class CategoryDialogComponent {
  private readonly ref = inject<MatDialogRef<CategoryDialogComponent, CategoryInput>>(MatDialogRef);
  private readonly data = inject<Category | null>(MAT_DIALOG_DATA);
  readonly editing = !!this.data;
  model: Required<CategoryInput> = {
    name: this.data?.name ?? '',
    description: this.data?.description ?? '',
    icon: this.data?.icon ?? 'school',
    colorHex: this.data?.colorHex ?? '#6366f1',
  };
  save(): void {
    if (!this.model.name.trim()) return;
    this.ref.close(this.model);
  }
}
