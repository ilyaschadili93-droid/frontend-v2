import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Animated circular progress ring (SVG). */
@Component({
  selector: 'app-progress-ring',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ring" [style.width.px]="size()" [style.height.px]="size()">
      <svg [attr.width]="size()" [attr.height]="size()" [attr.viewBox]="viewBox()">
        <defs>
          <linearGradient [attr.id]="gradId()" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#6366f1" />
            <stop offset="50%" stop-color="#8b5cf6" />
            <stop offset="100%" stop-color="#ec4899" />
          </linearGradient>
        </defs>
        <circle [attr.cx]="center()" [attr.cy]="center()" [attr.r]="radius()"
                fill="none" [attr.stroke-width]="stroke()" class="track" />
        <circle [attr.cx]="center()" [attr.cy]="center()" [attr.r]="radius()"
                fill="none" [attr.stroke-width]="stroke()" stroke-linecap="round"
                [attr.stroke]="'url(#' + gradId() + ')'"
                [attr.stroke-dasharray]="circumference()"
                [attr.stroke-dashoffset]="offset()"
                class="value" [attr.transform]="'rotate(-90 ' + center() + ' ' + center() + ')'" />
      </svg>
      <div class="label">
        <span class="num">{{ value() }}<small>%</small></span>
        @if (caption()) { <span class="cap muted">{{ caption() }}</span> }
      </div>
    </div>
  `,
  styles: [`
    .ring { position: relative; display: inline-grid; place-items: center; }
    svg { display: block; }
    .track { stroke: var(--surface-3); }
    .value { transition: stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1); }
    .label {
      position: absolute; inset: 0;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
    }
    .num { font-family: var(--font-display); font-weight: 800; font-size: 1.5rem; line-height: 1; }
    .num small { font-size: 0.75rem; opacity: 0.7; }
    .cap { font-size: 0.72rem; margin-top: 2px; }
  `],
})
export class ProgressRingComponent {
  readonly value = input<number>(0);
  readonly size = input<number>(120);
  readonly stroke = input<number>(10);
  readonly caption = input<string | null>(null);

  private readonly uid = Math.random().toString(36).slice(2, 8);
  readonly gradId = () => `pr-grad-${this.uid}`;
  readonly center = computed(() => this.size() / 2);
  readonly radius = computed(() => this.size() / 2 - this.stroke());
  readonly circumference = computed(() => 2 * Math.PI * this.radius());
  readonly viewBox = computed(() => `0 0 ${this.size()} ${this.size()}`);
  readonly offset = computed(() => {
    const pct = Math.min(100, Math.max(0, this.value()));
    return this.circumference() * (1 - pct / 100);
  });
}
