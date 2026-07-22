import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Formateur } from '../../../core/models';
import { FormateurService } from '../../../core/services/formateur.service';
import { TrainerCardComponent } from '../../../shared/components/trainer-card/trainer-card';
import { CardSkeletonComponent } from '../../../shared/components/card-skeleton/card-skeleton';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state';
import { listStagger } from '../../../shared/animations/animations';

@Component({
  selector: 'app-trainers-list',
  imports: [TrainerCardComponent, CardSkeletonComponent, EmptyStateComponent, ErrorStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [listStagger],
  template: `
    <section class="container section-pad">
      <header class="page-head">
        <span class="eyebrow gradient-text">Meet your mentors</span>
        <h1><span class="gradient-text">AI Trainers</span></h1>
        <p class="muted">Anam.ai avatars that present modules and answer your questions out loud.</p>
      </header>

      @switch (status()) {
        @case ('loading') { <app-card-skeleton [count]="4" /> }
        @case ('error') { <app-error-state (retry)="load()" /> }
        @default {
          @if (trainers().length === 0) {
            <app-empty-state icon="smart_toy" title="No AI trainers yet"
              message="AI trainers will appear here once they are created." />
          } @else {
            <div class="grid" [@listStagger]="trainers().length">
              @for (t of trainers(); track t.id) {
                <app-trainer-card [trainer]="t" />
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
    .page-head p { font-size: 1.05rem; max-width: 560px; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 22px;
    }
  `],
})
export class TrainersListComponent {
  private readonly formateurService = inject(FormateurService);

  readonly status = signal<'loading' | 'error' | 'ready'>('loading');
  readonly trainers = signal<Formateur[]>([]);

  constructor() {
    this.load();
  }

  load(): void {
    this.status.set('loading');
    this.formateurService.getAll().subscribe({
      next: (t) => {
        this.trainers.set(t);
        this.status.set('ready');
      },
      error: () => this.status.set('error'),
    });
  }
}
