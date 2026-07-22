import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Formation, FormationSummary } from '../../../core/models';
import { difficultyClass } from '../../../core/utils/ui.util';
import { DurationPipe } from '../../pipes/duration.pipe';

@Component({
  selector: 'app-formation-card',
  imports: [RouterLink, DurationPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="card surface-card" [routerLink]="['/formations', vm().id]">
      <div class="cover" [style.background]="cover()">
        <span class="difficulty chip" [class]="diffClass()">{{ vm().difficulty }}</span>
        <span class="material-icons-round watermark">menu_book</span>
        @if (vm().trainerName) {
          <span class="trainer"><span class="material-icons-round">smart_toy</span>{{ vm().trainerName }}</span>
        }
      </div>
      <div class="body">
        @if (vm().categoryName) { <span class="eyebrow muted">{{ vm().categoryName }}</span> }
        <h3>{{ vm().title }}</h3>
        <p class="desc muted">{{ vm().description }}</p>
        @if (vm().techs.length) {
          <div class="techs">
            @for (t of vm().techs.slice(0, 3); track t) { <span class="chip">{{ t }}</span> }
            @if (vm().techs.length > 3) { <span class="chip">+{{ vm().techs.length - 3 }}</span> }
          </div>
        }
        <div class="foot">
          <span class="meta"><span class="material-icons-round">schedule</span>{{ vm().durationHours | duration }}</span>
          @if (vm().sessionCount !== null) {
            <span class="meta"><span class="material-icons-round">groups</span>{{ vm().sessionCount }} sessions</span>
          }
        </div>
      </div>
    </a>
  `,
  styleUrl: './formation-card.scss',
})
export class FormationCardComponent {
  readonly formation = input.required<Formation | FormationSummary>();
  /** Optional accent color (e.g. category color) for the cover gradient. */
  readonly accent = input<string | null>(null);

  readonly vm = computed(() => {
    const f = this.formation() as Formation;
    return {
      id: f.id,
      title: f.title,
      description: f.description,
      difficulty: f.difficulty,
      durationHours: f.durationHours,
      techs: f.technologies ?? [],
      trainerName: f.formateur?.name ?? null,
      categoryName: f.categorie?.name ?? null,
      sessionCount: f.sessions ? f.sessions.length : null,
    };
  });

  readonly diffClass = computed(() => difficultyClass(this.vm().difficulty));
  // V2 neo-brutalist: flat bold cover colour (no gradient).
  readonly cover = computed(() => this.accent() ?? 'var(--primary)');
}
