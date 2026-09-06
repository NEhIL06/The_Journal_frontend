import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  const auth = { isAuthenticated: vi.fn() };

  beforeEach(() => {
    auth.isAuthenticated.mockReset();
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: AuthService, useValue: auth }] });
  });

  it('allows an authenticated user', () => {
    auth.isAuthenticated.mockReturnValue(true);
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/journal' } as RouterStateSnapshot),
    );
    expect(result).toBe(true);
  });

  it('redirects a guest to login and retains the destination', () => {
    auth.isAuthenticated.mockReturnValue(false);
    const router = TestBed.inject(Router);
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/journal/new' } as RouterStateSnapshot),
    ) as UrlTree;
    expect(router.serializeUrl(result)).toBe('/login?returnUrl=%2Fjournal%2Fnew');
  });
});
