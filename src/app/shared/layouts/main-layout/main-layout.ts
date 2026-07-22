import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, NavbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-navbar />

    <main class="content">
      <router-outlet />
    </main>

    <footer class="footer">
      <div class="container foot-inner">
        <div class="brand-col">
          <a class="brand" routerLink="/home">
            <span class="logo"><span class="material-icons-round">smart_toy</span></span>
            <span class="name">Formateur<span class="gradient-text"> AI</span></span>
          </a>
          <p class="muted">Learn anything from AI trainers — presented and answered out loud, powered by Anam.ai.</p>
        </div>
        <div class="col">
          <h4>Explore</h4>
          <a routerLink="/categories">Categories</a>
          <a routerLink="/sessions">Sessions</a>
          <a routerLink="/trainers">AI Trainers</a>
        </div>
        <div class="col">
          <h4>Account</h4>
          <a routerLink="/my-courses">My Courses</a>
          <a routerLink="/home">Get started</a>
        </div>
        <div class="col">
          <h4>Tech</h4>
          <span class="muted">Angular 21 · Material</span>
          <span class="muted">.NET 8 Web API</span>
          <span class="muted">SQLite · Anam.ai</span>
        </div>
      </div>
      <div class="container copy">
        <span class="muted">© {{ year }} Formateur AI. Crafted for learning.</span>
      </div>
    </footer>
  `,
  styleUrl: './main-layout.scss',
})
export class MainLayoutComponent {
  readonly year = new Date().getFullYear();
}
