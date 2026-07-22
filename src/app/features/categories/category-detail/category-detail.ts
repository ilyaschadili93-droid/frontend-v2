import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Category, Formation } from '../../../core/models';
import { CategoryService } from '../../../core/services/category.service';
import { FormationService } from '../../../core/services/formation.service';
import { FormationCardComponent } from '../../../shared/components/formation-card/formation-card';
import { CardSkeletonComponent } from '../../../shared/components/card-skeleton/card-skeleton';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card';
import { listStagger } from '../../../shared/animations/animations';

@Component({
  selector: 'app-category-detail',
  imports: [
    RouterLink, FormationCardComponent, CardSkeletonComponent,
    EmptyStateComponent, ErrorStateComponent, StatCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [listStagger],
  templateUrl: './category-detail.html',
  styleUrl: './category-detail.scss',
})
export class CategoryDetailComponent {
  private readonly categoryService = inject(CategoryService);
  private readonly formationService = inject(FormationService);

  /** Bound from the :id route param via withComponentInputBinding. */
  readonly id = input.required<string>();

  readonly status = signal<'loading' | 'error' | 'ready'>('loading');
  readonly category = signal<Category | null>(null);
  readonly formations = signal<Formation[]>([]);

  readonly totalHours = computed(() => this.formations().reduce((n, f) => n + f.durationHours, 0));
  readonly totalSessions = computed(() => this.formations().reduce((n, f) => n + (f.sessions?.length ?? 0), 0));

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) this.load(id);
    });
  }

  load(id = this.id()): void {
    this.status.set('loading');
    forkJoin({
      category: this.categoryService.getById(id),
      formations: this.formationService.getAll(id),
    }).subscribe({
      next: ({ category, formations }) => {
        this.category.set(category);
        this.formations.set(formations);
        this.status.set('ready');
      },
      error: () => this.status.set('error'),
    });
  }
}
