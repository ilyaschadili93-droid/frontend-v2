import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CategoriesAdminComponent } from './managers/categories-admin';
import { FormationsAdminComponent } from './managers/formations-admin';
import { TrainersAdminComponent } from './managers/trainers-admin';
import { SessionsAdminComponent } from './managers/sessions-admin';
import { UsersAdminComponent } from './managers/users-admin';

type Tab = 'categories' | 'formations' | 'trainers' | 'sessions' | 'users';

@Component({
  selector: 'app-admin',
  imports: [
    CategoriesAdminComponent, FormationsAdminComponent, TrainersAdminComponent,
    SessionsAdminComponent, UsersAdminComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="container section-pad">
      <header class="admin-head">
        <span class="eyebrow gradient-text">Administration</span>
        <h1>Manage <span class="gradient-text">everything</span></h1>
        <p class="muted">Create, edit and delete categories, formations, AI trainers, sessions and users.</p>
      </header>

      <nav class="tabs">
        @for (t of tabs; track t.id) {
          <button class="tab" [class.on]="tab() === t.id" (click)="tab.set(t.id)">
            <span class="material-icons-round">{{ t.icon }}</span> {{ t.label }}
          </button>
        }
      </nav>

      <div class="content surface-card">
        @switch (tab()) {
          @case ('categories') { <app-categories-admin /> }
          @case ('formations') { <app-formations-admin /> }
          @case ('trainers') { <app-trainers-admin /> }
          @case ('sessions') { <app-sessions-admin /> }
          @case ('users') { <app-users-admin /> }
        }
      </div>
    </section>
  `,
  styles: [`
    .admin-head { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
    .eyebrow { font-weight: 700; font-size: 0.82rem; letter-spacing: 0.12em; text-transform: uppercase; }
    h1 { font-size: clamp(1.8rem, 4vw, 2.6rem); }
    .admin-head p { margin: 0; }
    .tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
    .tab {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 9px 15px; border-radius: 999px;
      border: 1px solid var(--border); background: var(--surface);
      color: var(--text-muted); font-weight: 600; font-size: 0.88rem; cursor: pointer;
      transition: all 0.2s var(--ease-out);
    }
    .tab .material-icons-round { font-size: 18px; }
    .tab:hover { color: var(--text); border-color: var(--border-strong); }
    .tab.on { color: #fff; border-color: transparent; background: var(--gradient-brand); box-shadow: var(--shadow-brand); }
    .content { padding: 8px; }
  `],
})
export class AdminComponent {
  readonly tab = signal<Tab>('categories');
  readonly tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'categories', label: 'Categories', icon: 'category' },
    { id: 'formations', label: 'Formations', icon: 'menu_book' },
    { id: 'trainers', label: 'AI Trainers', icon: 'smart_toy' },
    { id: 'sessions', label: 'Sessions', icon: 'groups' },
    { id: 'users', label: 'Users', icon: 'people' },
  ];
}
