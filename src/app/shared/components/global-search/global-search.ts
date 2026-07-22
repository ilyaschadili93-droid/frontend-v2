import { ChangeDetectionStrategy, Component, ElementRef, HostListener, OnInit, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { SearchResult, SearchService } from '../../../core/services/search.service';

/** Global search field with a live results dropdown. */
@Component({
  selector: 'app-global-search',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="search" [class.open]="open()">
      <span class="material-icons-round lead">search</span>
      <input
        #box
        type="text"
        [(ngModel)]="query"
        (ngModelChange)="onInput($event)"
        (focus)="open.set(true)"
        placeholder="Search courses, trainers…"
        aria-label="Global search"
      />
      @if (query) {
        <button class="clear" (click)="clear()" aria-label="Clear"><span class="material-icons-round">close</span></button>
      }

      @if (open() && query.trim()) {
        <div class="panel surface-card">
          @if (loading()) {
            <div class="hint muted">Searching…</div>
          } @else if (results().length === 0) {
            <div class="hint muted">No results for “{{ query }}”.</div>
          } @else {
            @for (r of results(); track r.type + r.id) {
              <button class="result" (click)="go(r)">
                <span class="ic material-icons-round" [attr.data-type]="r.type">{{ r.icon }}</span>
                <span class="txt">
                  <span class="title">{{ r.title }}</span>
                  <span class="sub muted">{{ r.subtitle }}</span>
                </span>
                <span class="type-chip">{{ r.type }}</span>
              </button>
            }
          }
        </div>
      }
    </div>
  `,
  styleUrl: './global-search.scss',
})
export class GlobalSearchComponent implements OnInit {
  private readonly searchService = inject(SearchService);
  private readonly router = inject(Router);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly input$ = new Subject<string>();

  private readonly box = viewChild<ElementRef<HTMLInputElement>>('box');

  query = '';
  readonly open = signal(false);
  readonly loading = signal(false);
  readonly results = signal<SearchResult[]>([]);

  ngOnInit(): void {
    this.input$
      .pipe(
        debounceTime(220),
        distinctUntilChanged(),
        switchMap((q) => {
          this.loading.set(true);
          return this.searchService.search(q);
        }),
      )
      .subscribe((r) => {
        this.results.set(r);
        this.loading.set(false);
      });
  }

  onInput(value: string): void {
    this.open.set(true);
    if (!value.trim()) {
      this.results.set([]);
      this.loading.set(false);
      return;
    }
    this.input$.next(value);
  }

  go(r: SearchResult): void {
    this.router.navigate(r.routerLink as unknown[]);
    this.clear();
  }

  clear(): void {
    this.query = '';
    this.results.set([]);
    this.open.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (!this.host.nativeElement.contains(e.target as Node)) this.open.set(false);
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    this.open.set(false);
    this.box()?.nativeElement.blur();
  }
}
