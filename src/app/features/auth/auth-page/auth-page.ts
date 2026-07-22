import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

type Mode = 'login' | 'register';

@Component({
  selector: 'app-auth-page',
  imports: [FormsModule, RouterLink, MatButtonModule, MatProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './auth-page.html',
  styleUrl: './auth-page.scss',
})
export class AuthPageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Bound from route data ({ mode }) via withComponentInputBinding. */
  readonly mode = input<Mode>('login');
  /** Bound from ?returnUrl=... query param. */
  readonly returnUrl = input<string>('');

  readonly isRegister = computed(() => this.mode() === 'register');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  userName = '';
  email = '';
  password = '';

  emailValid(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim());
  }

  formValid(): boolean {
    if (this.isRegister()) {
      return this.userName.trim().length >= 2 && this.emailValid() && this.password.length >= 6;
    }
    // Login is lenient (accepts username or email) — the server validates.
    return this.email.trim().length > 0 && this.password.length > 0;
  }

  submit(): void {
    if (this.loading() || !this.formValid()) return;
    this.loading.set(true);
    this.error.set(null);

    const request$ = this.isRegister()
      ? this.auth.register({ userName: this.userName.trim(), email: this.email.trim(), password: this.password })
      : this.auth.login({ email: this.email.trim(), password: this.password });

    request$.subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl(this.returnUrl() || '/home');
      },
      error: (e: unknown) => {
        this.error.set(this.messageFrom(e));
        this.loading.set(false);
      },
    });
  }

  private messageFrom(e: unknown): string {
    const err = e as { error?: unknown; message?: string };
    if (err?.error && typeof err.error === 'string') return err.error;
    if (err?.message) return err.message;
    return 'Authentication failed. Please try again.';
  }
}
