import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppUser, AuthResponse, LoginRequest, RegisterRequest } from '../models';
import { mockStore } from '../mock/mock-store';
import { mockOk } from '../utils/mock.util';
import { ApiService } from './api.service';

const TOKEN_KEY = 'formateur-ai-token';
const USER_KEY = 'formateur-ai-user';

/**
 * Authentication state, backed by the Users table on the .NET API
 * (or the mock store when environment.useMockData is true).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly useMock = environment.useMockData;

  readonly currentUser = signal<AppUser | null>(this.readStoredUser());
  readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.isAdmin ?? false);

  login(request: LoginRequest): Observable<AuthResponse> {
    if (this.useMock) {
      const res = mockStore.login(request.email, request.password);
      if (!res) return throwError(() => new Error('Invalid email or password.'));
      return mockOk(res).pipe(tap((r) => this.persist(r)));
    }
    return this.api.post<AuthResponse>('auth/login', request).pipe(tap((r) => this.persist(r)));
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    if (this.useMock) {
      const res = mockStore.register(request.userName, request.email, request.password);
      if (res === 'conflict') return throwError(() => new Error('An account with this email already exists.'));
      return mockOk(res).pipe(tap((r) => this.persist(r)));
    }
    return this.api.post<AuthResponse>('auth/register', request).pipe(tap((r) => this.persist(r)));
  }

  logout(): void {
    this.currentUser.set(null);
    this.token.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  private persist(res: AuthResponse): void {
    this.token.set(res.token);
    this.currentUser.set(res.user);
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
  }

  private readStoredUser(): AppUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AppUser) : null;
    } catch {
      return null;
    }
  }
}
