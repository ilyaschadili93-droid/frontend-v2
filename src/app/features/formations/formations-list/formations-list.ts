import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Category, Difficulty, Formation } from '../../../core/models';
import { CategoryService } from '../../../core/services/category.service';
import { FormationService } from '../../../core/services/formation.service';
import { FormationCardComponent } from '../../../shared/components/formation-card/formation-card';
import { CardSkeletonComponent } from '../../../shared/components/card-skeleton/card-skeleton';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state';
import { listStagger } from '../../../shared/animations/animations';

@Component({
  selector: 'app-formations-list',
  imports: [FormationCardComponent, CardSkeletonComponent, EmptyStateComponent, ErrorStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [listStagger],
  template: `
    <section class="container section-pad">
      <header class="page-head">
        <span class="eyebrow gradient-text">All courses</span>
        <h1>Browse <span class="gradient-text">Formations</span></h1>
        <p class="muted">Filter by category and difficulty to find your next AI-guided course.</p>
      </header>

      @if (status() !== 'loading' && status() !== 'error') {
        <div class="filters">
          <div class="chips">
            <button class="fchip" [class.on]="activeCategory() === null" (click)="activeCategory.set(null)">All</button>
            @for (c of categories(); track c.id) {
              <button class="fchip" [class.on]="activeCategory() === c.id" (click)="activeCategory.set(c.id)"
                [style.--accent]="c.colorHex">
                <span class="material-icons-round">{{ c.icon }}</span> {{ c.name }}
              </button>
            }
          </div>
          <div class="chips">
            @for (d of difficulties; track d) {
              <button class="fchip small" [class.on]="activeDifficulty() === d" (click)="toggleDifficulty(d)">{{ d }}</button>
            }
          </div>
        </div>
      }

      @switch (status()) {
        @case ('loading') { <app-card-skeleton [count]="6" /> }
        @case ('error') { <app-error-state (retry)="load()" /> }
        @default {
          @if (filtered().length === 0) {
            <app-empty-state icon="filter_alt_off" title="No formations match"
              message="Try clearing the filters to see more courses." actionLabel="Clear filters"
              (action)="clearFilters()" />
          } @else {
            <div class="grid" [@listStagger]="filtered().length">
              @for (f of filtered(); track f.id) {
                <app-formation-card [formation]="f" [accent]="accentFor(f)" />
              }
            </div>
          }
        }
      }
    </section>
  `,
  styleUrl: './formations-list.scss',
})
export class FormationsListComponent {
  private readonly formationService = inject(FormationService);
  private readonly categoryService = inject(CategoryService);

  readonly difficulties: Difficulty[] = ['Beginner', 'Intermediate', 'Advanced'];

  readonly status = signal<'loading' | 'error' | 'ready'>('loading');
  readonly formations = signal<Formation[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly activeCategory = signal<string | null>(null);
  readonly activeDifficulty = signal<Difficulty | null>(null);

  readonly filtered = computed(() =>
    this.formations().filter(
      (f) =>
        (this.activeCategory() === null || f.categorieId === this.activeCategory()) &&
        (this.activeDifficulty() === null || f.difficulty === this.activeDifficulty()),
    ),
  );

  constructor() {
    this.load();
  }

  load(): void {
    this.status.set('loading');
    forkJoin({
      formations: this.formationService.getAll(),
      categories: this.categoryService.getAll(),
    }).subscribe({
      next: ({ formations, categories }) => {
        this.formations.set(formations);
        this.categories.set(categories);
        this.status.set('ready');
      },
      error: () => this.status.set('error'),
    });
  }

  toggleDifficulty(d: Difficulty): void {
    this.activeDifficulty.update((cur) => (cur === d ? null : d));
  }

  clearFilters(): void {
    this.activeCategory.set(null);
    this.activeDifficulty.set(null);
  }

  accentFor(f: Formation): string | null {
    return this.categories().find((c) => c.id === f.categorieId)?.colorHex ?? null;
  }
}
