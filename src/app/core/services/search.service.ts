import { Injectable, inject } from '@angular/core';
import { Observable, combineLatest, catchError, map, of } from 'rxjs';
import { Session } from '../models';
import { CategoryService } from './category.service';
import { FormationService } from './formation.service';
import { FormateurService } from './formateur.service';
import { SessionService } from './session.service';
import { AuthService } from './auth.service';

export type SearchResultType = 'category' | 'formation' | 'trainer' | 'session';

export interface SearchResult {
  type: SearchResultType;
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  routerLink: unknown[];
}

/** Global search across categories, formations, trainers and sessions. */
@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly categories = inject(CategoryService);
  private readonly formations = inject(FormationService);
  private readonly trainers = inject(FormateurService);
  private readonly sessions = inject(SessionService);
  private readonly auth = inject(AuthService);

  search(query: string): Observable<SearchResult[]> {
    const q = query.trim().toLowerCase();

    // Sessions are sign-in only — anonymous visitors search the public catalog only.
    const sessions$ = this.auth.isAuthenticated()
      ? this.sessions.getAll().pipe(catchError(() => of<Session[]>([])))
      : of<Session[]>([]);

    return combineLatest([
      this.categories.getAll().pipe(catchError(() => of([]))),
      this.formations.getAll().pipe(catchError(() => of([]))),
      this.trainers.getAll().pipe(catchError(() => of([]))),
      sessions$,
    ]).pipe(
      map(([categories, formations, trainers, sessions]) => {
        if (!q) return [];
        const results: SearchResult[] = [];

        for (const c of categories) {
          if (this.matches(q, c.name, c.description)) {
            results.push({ type: 'category', id: c.id, title: c.name, subtitle: `${c.formationCount} formations`, icon: c.icon, routerLink: ['/categories', c.id] });
          }
        }
        for (const f of formations) {
          if (this.matches(q, f.title, f.description, ...f.technologies)) {
            results.push({ type: 'formation', id: f.id, title: f.title, subtitle: f.categorie?.name ?? f.difficulty, icon: 'menu_book', routerLink: ['/formations', f.id] });
          }
        }
        for (const t of trainers) {
          if (this.matches(q, t.name, t.bio, t.expertise)) {
            results.push({ type: 'trainer', id: t.id, title: t.name, subtitle: t.expertise.split(',').slice(0, 2).join(', '), icon: 'smart_toy', routerLink: ['/trainers', t.id] });
          }
        }
        for (const s of sessions) {
          if (this.matches(q, s.title, s.formationTitle)) {
            results.push({ type: 'session', id: s.id, title: s.title, subtitle: `${s.progress}% complete`, icon: 'groups', routerLink: ['/sessions', s.id] });
          }
        }
        return results.slice(0, 20);
      }),
    );
  }

  private matches(q: string, ...fields: (string | undefined)[]): boolean {
    return fields.some((f) => (f ?? '').toLowerCase().includes(q));
  }
}
