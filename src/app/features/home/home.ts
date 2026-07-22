import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { forkJoin } from 'rxjs';
import { Category, Formateur, Formation } from '../../core/models';
import { CategoryService } from '../../core/services/category.service';
import { FormationService } from '../../core/services/formation.service';
import { FormateurService } from '../../core/services/formateur.service';
import { CategoryCardComponent } from '../../shared/components/category-card/category-card';
import { FormationCardComponent } from '../../shared/components/formation-card/formation-card';
import { TrainerCardComponent } from '../../shared/components/trainer-card/trainer-card';
import { CardSkeletonComponent } from '../../shared/components/card-skeleton/card-skeleton';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state';
import { enterAnimation, listStagger } from '../../shared/animations/animations';

@Component({
  selector: 'app-home',
  imports: [
    RouterLink, MatButtonModule, CategoryCardComponent, FormationCardComponent,
    TrainerCardComponent, CardSkeletonComponent, ErrorStateComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [enterAnimation, listStagger],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent {
  private readonly categoryService = inject(CategoryService);
  private readonly formationService = inject(FormationService);
  private readonly formateurService = inject(FormateurService);

  readonly status = signal<'loading' | 'error' | 'ready'>('loading');
  readonly categories = signal<Category[]>([]);
  readonly formations = signal<Formation[]>([]);
  readonly trainers = signal<Formateur[]>([]);

  readonly featured = computed(() => this.formations().slice(0, 6));
  readonly topTrainers = computed(() => this.trainers().slice(0, 3));
  // Derived from formations (Sessions endpoint is now sign-in only).
  readonly sessionCount = computed(() => this.formations().reduce((n, f) => n + (f.sessions?.length ?? 0), 0));

  readonly stats = computed(() => [
    { icon: 'category', value: this.categories().length, label: 'Categories' },
    { icon: 'menu_book', value: this.formations().length, label: 'Formations' },
    { icon: 'smart_toy', value: this.trainers().length, label: 'AI Trainers' },
    { icon: 'groups', value: this.sessionCount(), label: 'Live Sessions' },
  ]);

  constructor() {
    this.load();
  }

  load(): void {
    this.status.set('loading');
    forkJoin({
      categories: this.categoryService.getAll(),
      formations: this.formationService.getAll(),
      trainers: this.formateurService.getAll(),
    }).subscribe({
      next: ({ categories, formations, trainers }) => {
        this.categories.set(categories);
        this.formations.set(formations);
        this.trainers.set(trainers);
        this.status.set('ready');
      },
      error: () => this.status.set('error'),
    });
  }

  accentFor(f: Formation): string | null {
    return this.categories().find((c) => c.id === f.categorieId)?.colorHex ?? null;
  }
}
