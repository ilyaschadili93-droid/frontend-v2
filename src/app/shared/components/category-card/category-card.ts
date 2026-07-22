import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category } from '../../../core/models';

@Component({
  selector: 'app-category-card',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="card surface-card" [routerLink]="['/categories', category().id]"
       [style.--accent]="category().colorHex">
      <div class="glow"></div>
      <div class="ic"><span class="material-icons-round">{{ category().icon }}</span></div>
      <h3>{{ category().name }}</h3>
      <p class="muted">{{ category().description }}</p>
      <div class="foot">
        <span class="count">{{ category().formationCount }} formations</span>
        <span class="arrow material-icons-round">arrow_forward</span>
      </div>
    </a>
  `,
  styles: [`
    .card {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 22px;
      overflow: hidden;
      transition: transform 0.14s var(--ease-out), box-shadow 0.14s var(--ease-out);
    }
    .card:hover { transform: translate(-4px, -4px); box-shadow: var(--shadow-lg); }
    .card:hover .arrow { transform: translateX(4px); }
    .glow {
      position: absolute; top: 0; right: 0;
      width: 64px; height: 64px;
      background: var(--accent);
      border-left: 2px solid var(--ink); border-bottom: 2px solid var(--ink);
      border-bottom-left-radius: 14px;
    }
    .ic {
      position: relative; z-index: 1;
      width: 56px; height: 56px; border-radius: 13px;
      display: grid; place-items: center; color: #fff;
      background: var(--accent);
      border: 2px solid var(--ink);
      box-shadow: var(--shadow-sm);
    }
    .ic .material-icons-round { font-size: 28px; color: #16130f; }
    h3 { font-size: 1.25rem; }
    p {
      font-size: 0.9rem; line-height: 1.5; margin: 0; color: var(--text-muted);
      display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2;
      -webkit-box-orient: vertical; overflow: hidden;
    }
    .foot {
      margin-top: auto; padding-top: 12px;
      display: flex; align-items: center; justify-content: space-between;
      border-top: 2px solid var(--ink);
    }
    .count { font-family: var(--font-mono); font-weight: 700; font-size: 0.8rem; color: var(--ink); padding-top: 12px; }
    .arrow { color: var(--ink); transition: transform 0.2s var(--ease-out); padding-top: 12px; }
  `],
})
export class CategoryCardComponent {
  readonly category = input.required<Category>();
}
