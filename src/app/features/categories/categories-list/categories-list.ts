import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Category } from '../../../core/models';
import { CategoryService } from '../../../core/services/category.service';
import { CategoryCardComponent } from '../../../shared/components/category-card/category-card';
import { CardSkeletonComponent } from '../../../shared/components/card-skeleton/card-skeleton';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state';
import { listStagger } from '../../../shared/animations/animations';

@Component({
  selector: 'app-categories-list',
  imports: [CategoryCardComponent, CardSkeletonComponent, EmptyStateComponent, ErrorStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [listStagger],
  template: `
    <section class="container section-pad">
      <header class="page-head">
        <span class="eyebrow gradient-text">Browse by topic</span>
        <h1>Explore <span class="gradient-text">Categories</span></h1>
        <p class="muted">Pick a field and let an AI trainer guide you through hands-on formations.</p>
      </header>

      @switch (status()) {
        @case ('loading') { <app-card-skeleton [count]="4" /> }
        @case ('error') { <app-error-state (retry)="load()" /> }
        @default {
          @if (categories().length === 0) {
            <app-empty-state icon="category" title="No categories yet"
              message="Categories will appear here once they are created." />
          } @else {
            <div class="grid" [@listStagger]="categories().length">
              @for (c of categories(); track c.id) {
                <app-category-card [category]="c" />
              }
            </div>
          }
        }
      }
    </section>
  `,
  styles: [`
    .page-head { display: flex; flex-direction: column; gap: 10px; margin-bottom: 34px; }
    .eyebrow { font-weight: 700; font-size: 0.82rem; letter-spacing: 0.12em; text-transform: uppercase; }
    h1 { font-size: clamp(2rem, 5vw, 3rem); }
    p { font-size: 1.05rem; max-width: 560px; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 22px;
    }
  `],
})
export class CategoriesListComponent {
  private readonly categoryService = inject(CategoryService);

  readonly status = signal<'loading' | 'error' | 'ready'>('loading');
  readonly categories = signal<Category[]>([]);

  constructor() {
    this.load();
  }

  load(): void {
    this.status.set('loading');
    this.categoryService.getAll().subscribe({
      next: (c) => {
        this.categories.set(c);
        this.status.set('ready');
      },
      error: () => this.status.set('error'),
    });
  }
}
