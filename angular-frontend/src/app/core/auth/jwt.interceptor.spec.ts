import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';
import { jwtInterceptor } from './jwt.interceptor';

describe('jwtInterceptor', () => {
  const auth = { getToken: vi.fn(), logout: vi.fn() };
  let http: HttpTestingController;

  beforeEach(() => {
    auth.getToken.mockReturnValue('jwt-token');
    auth.logout.mockReset();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([jwtInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('adds a bearer token to protected API requests', () => {
    const client = TestBed.inject(HttpClient);
    client.get(`${environment.apiBaseUrl}/journal`).subscribe();
    const request = http.expectOne(`${environment.apiBaseUrl}/journal`);
    expect(request.request.headers.get('Authorization')).toBe('Bearer jwt-token');
    request.flush([]);
  });

  it('does not add a token to public API requests', () => {
    const client = TestBed.inject(HttpClient);
    client.post(`${environment.apiBaseUrl}/public/Login`, {}).subscribe();
    const request = http.expectOne(`${environment.apiBaseUrl}/public/Login`);
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush('token');
  });

  it('clears the session after a protected 401 response', () => {
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const client = TestBed.inject(HttpClient);
    client.get(`${environment.apiBaseUrl}/journal`).subscribe({ error: () => undefined });
    http.expectOne(`${environment.apiBaseUrl}/journal`).flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(auth.logout).toHaveBeenCalledOnce();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { sessionExpired: true } });
  });
});
