import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Section heading with an eyebrow label, title and optional subtitle. */
@Component({
  selector: 'app-section-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="sh">
      @if (eyebrow()) { <span class="eyebrow gradient-text">{{ eyebrow() }}</span> }
      <h2>{{ title() }}</h2>
      @if (subtitle()) { <p class="muted">{{ subtitle() }}</p> }
    </header>
  `,
  styles: [`
    .sh { display: flex; flex-direction: column; gap: 8px; margin-bottom: 26px; }
    .eyebrow { font-weight: 700; font-size: 0.82rem; letter-spacing: 0.12em; text-transform: uppercase; }
    h2 { font-size: clamp(1.6rem, 3vw, 2.3rem); }
    p { max-width: 620px; margin: 0; font-size: 1.02rem; }
  `],
})
export class SectionHeaderComponent {
  readonly eyebrow = input<string | null>(null);
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
}
