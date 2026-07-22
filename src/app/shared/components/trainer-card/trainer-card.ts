import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Formateur } from '../../../core/models';
import { AvatarComponent } from '../avatar/avatar';

@Component({
  selector: 'app-trainer-card',
  imports: [RouterLink, AvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="card surface-card" [routerLink]="['/trainers', trainer().id]">
      <div class="head">
        <app-avatar [name]="trainer().name" [size]="64" badge="smart_toy" />
        <span class="ai-chip"><span class="material-icons-round">auto_awesome</span> AI Trainer</span>
      </div>
      <h3>{{ trainer().name }}</h3>
      <p class="bio muted">{{ trainer().bio }}</p>
      <div class="tags">
        @for (e of expertise(); track e) { <span class="chip">{{ e }}</span> }
      </div>
      <div class="foot">
        <span class="model"><span class="material-icons-round">memory</span>{{ trainer().avatarModel }}</span>
        <span class="courses">{{ trainer().formations.length }} courses</span>
      </div>
    </a>
  `,
  styles: [`
    .card {
      display: flex; flex-direction: column; gap: 10px; padding: 22px;
      transition: transform 0.35s var(--ease-out), box-shadow 0.35s var(--ease-out);
    }
    .card:hover { transform: translate(-4px, -4px); box-shadow: var(--shadow-lg); }
    .head { display: flex; align-items: center; justify-content: space-between; }
    .ai-chip {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 4px 10px; border-radius: 999px;
      font-family: var(--font-mono); font-size: 0.68rem; font-weight: 700;
      color: #16130f; background: var(--green); border: 2px solid var(--ink);
    }
    .ai-chip .material-icons-round { font-size: 15px; }
    h3 { font-size: 1.2rem; }
    .bio {
      font-size: 0.9rem; line-height: 1.5; margin: 0;
      display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2;
      -webkit-box-orient: vertical; overflow: hidden;
    }
    .tags { display: flex; flex-wrap: wrap; gap: 6px; }
    .tags .chip { font-size: 0.72rem; padding: 3px 9px; }
    .foot {
      margin-top: auto; padding-top: 12px; border-top: 2px solid var(--ink);
      display: flex; align-items: center; justify-content: space-between;
      font-size: 0.82rem; color: var(--text-muted);
    }
    .model { display: inline-flex; align-items: center; gap: 5px; font-family: var(--font-mono); font-weight: 700; }
    .model .material-icons-round { font-size: 16px; }
    .courses { font-family: var(--font-mono); font-weight: 700; }
  `],
})
export class TrainerCardComponent {
  readonly trainer = input.required<Formateur>();
  readonly expertise = computed(() =>
    this.trainer().expertise.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 3),
  );
}
