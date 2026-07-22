import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Formateur, FormateurSummary, Formation } from '../../../core/models';
import { FormateurService } from '../../../core/services/formateur.service';
import { FormationService } from '../../../core/services/formation.service';
import { AvatarComponent } from '../../../shared/components/avatar/avatar';
import { AiTrainerPanelComponent } from '../../../shared/components/ai-trainer-panel/ai-trainer-panel';
import { FormationCardComponent } from '../../../shared/components/formation-card/formation-card';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state';
import { enterAnimation, listStagger } from '../../../shared/animations/animations';

@Component({
  selector: 'app-trainer-detail',
  imports: [
    RouterLink, AvatarComponent, AiTrainerPanelComponent, FormationCardComponent,
    SkeletonComponent, ErrorStateComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [enterAnimation, listStagger],
  templateUrl: './trainer-detail.html',
  styleUrl: './trainer-detail.scss',
})
export class TrainerDetailComponent {
  private readonly formateurService = inject(FormateurService);
  private readonly formationService = inject(FormationService);

  readonly id = input.required<string>();

  readonly status = signal<'loading' | 'error' | 'ready'>('loading');
  readonly trainer = signal<Formateur | null>(null);
  readonly formations = signal<Formation[]>([]);

  readonly expertise = computed(() =>
    (this.trainer()?.expertise ?? '').split(',').map((s) => s.trim()).filter(Boolean),
  );

  /** Compact summary for the AI panel input. */
  readonly summary = computed<FormateurSummary | null>(() => {
    const t = this.trainer();
    return t
      ? { id: t.id, name: t.name, avatarModel: t.avatarModel, expertise: t.expertise, avatarVideoUrl: t.avatarVideoUrl }
      : null;
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) this.load(id);
    });
  }

  load(id = this.id()): void {
    this.status.set('loading');
    forkJoin({
      trainer: this.formateurService.getById(id),
      formations: this.formationService.getAll(),
    }).subscribe({
      next: ({ trainer, formations }) => {
        this.trainer.set(trainer);
        this.formations.set(formations.filter((f) => f.formateurId === trainer.id));
        this.status.set('ready');
      },
      error: () => this.status.set('error'),
    });
  }
}
