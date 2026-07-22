import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { Formation } from '../../../core/models';
import { FormationService } from '../../../core/services/formation.service';
import { difficultyClass } from '../../../core/utils/ui.util';
import { DurationPipe } from '../../../shared/pipes/duration.pipe';
import { AiTrainerPanelComponent } from '../../../shared/components/ai-trainer-panel/ai-trainer-panel';
import { AvatarComponent } from '../../../shared/components/avatar/avatar';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state';
import { enterAnimation } from '../../../shared/animations/animations';

@Component({
  selector: 'app-formation-detail',
  imports: [
    RouterLink, DatePipe, MatButtonModule, DurationPipe, AiTrainerPanelComponent,
    AvatarComponent, SkeletonComponent, ErrorStateComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [enterAnimation],
  templateUrl: './formation-detail.html',
  styleUrl: './formation-detail.scss',
})
export class FormationDetailComponent {
  private readonly formationService = inject(FormationService);

  readonly id = input.required<string>();

  readonly status = signal<'loading' | 'error' | 'ready'>('loading');
  readonly formation = signal<Formation | null>(null);

  readonly diffClass = computed(() => {
    const f = this.formation();
    return f ? difficultyClass(f.difficulty) : '';
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) this.load(id);
    });
  }

  load(id = this.id()): void {
    this.status.set('loading');
    this.formationService.getById(id).subscribe({
      next: (f) => {
        this.formation.set(f);
        this.status.set('ready');
      },
      error: () => this.status.set('error'),
    });
  }
}
