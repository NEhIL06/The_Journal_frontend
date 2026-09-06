import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthSession, LoginRequest, RegistrationRequest, UserResponse } from '../models/auth.models';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly sessionSubject = new BehaviorSubject<AuthSession | null>(this.readSession());

  readonly session$ = this.sessionSubject.asObservable();
  readonly userName$ = this.session$.pipe(map((session) => session?.userName ?? null));

  login(credentials: LoginRequest): Observable<AuthSession> {
    return this.http
      .post(`${environment.apiBaseUrl}/public/Login`, credentials, { responseType: 'text' })
      .pipe(
        map((token) => ({ token: token.trim(), userName: credentials.userName })),
        tap((session) => this.persistSession(session)),
      );
  }

  register(request: RegistrationRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${environment.apiBaseUrl}/public/SignUp`, request);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    this.sessionSubject.next(null);
  }

  getToken(): string | null {
    return this.sessionSubject.value?.token ?? null;
  }

  getUserName(): string | null {
    return this.sessionSubject.value?.userName ?? null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(this.decodeBase64Url(token.split('.')[1])) as { exp?: number };
      if (payload.exp && payload.exp * 1000 <= Date.now()) {
        this.logout();
        return false;
      }
    } catch {
      // The backend remains the source of truth for malformed or opaque tokens.
    }
    return true;
  }

  private persistSession(session: AuthSession): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(TOKEN_KEY, session.token);
      localStorage.setItem(USER_KEY, session.userName);
    }
    this.sessionSubject.next(session);
  }

  private readSession(): AuthSession | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const token = localStorage.getItem(TOKEN_KEY);
    const userName = localStorage.getItem(USER_KEY);
    return token && userName ? { token, userName } : null;
  }

  private decodeBase64Url(value = ''): string {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    return atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
  }
}
