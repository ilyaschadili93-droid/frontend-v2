import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';
import { AvatarComponent } from '../../components/avatar/avatar';
import { GlobalSearchComponent } from '../../components/global-search/global-search';

interface NavItem { label: string; link: string; icon: string; authOnly?: boolean; }

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink, RouterLinkActive, MatButtonModule, MatMenuModule,
    MatBadgeModule, MatDividerModule, AvatarComponent, GlobalSearchComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class NavbarComponent {
  private readonly theme = inject(ThemeService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly mobileOpen = signal(false);
  readonly isDark = this.theme.theme;
  readonly user = this.auth.currentUser;
  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly isAdmin = this.auth.isAdmin;

  readonly navItems: NavItem[] = [
    { label: 'Home', link: '/home', icon: 'home' },
    { label: 'Categories', link: '/categories', icon: 'category' },
    { label: 'AI Trainers', link: '/trainers', icon: 'smart_toy' },
    { label: 'Sessions', link: '/sessions', icon: 'groups', authOnly: true },
    { label: 'My Courses', link: '/my-courses', icon: 'school', authOnly: true },
  ];

  readonly notifications = [
    { icon: 'auto_awesome', text: 'New AI trainer “David Leroy” joined Finance.' },
    { icon: 'menu_book', text: '“Programmation API REST” added a new session.' },
    { icon: 'workspace_premium', text: 'You reached 80% on “POO en C#”.' },
  ];

  toggleTheme(): void {
    this.theme.toggle();
  }

  toggleMobile(): void {
    this.mobileOpen.update((v) => !v);
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/home');
  }
}
