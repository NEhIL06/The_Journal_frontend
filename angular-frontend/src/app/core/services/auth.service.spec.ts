import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('logs in with the backend contract and stores the plain-text JWT', () => {
    service.login({ userName: 'writer', password: 'secret' }).subscribe((session) => {
      expect(session).toEqual({ token: 'jwt-token', userName: 'writer' });
    });

    const request = http.expectOne(`${environment.apiBaseUrl}/public/Login`);
    expect(request.request.method).toBe('POST');
    expect(request.request.responseType).toBe('text');
    expect(request.request.body).toEqual({ userName: 'writer', password: 'secret' });
    request.flush(' jwt-token ');

    expect(service.getToken()).toBe('jwt-token');
    expect(localStorage.getItem('user')).toBe('writer');
  });

  it('registers using the existing SignUp endpoint and field names', () => {
    const payload = { userName: 'writer', email: 'writer@example.com', password: 'secret' };
    service.register(payload).subscribe((user) => expect(user.userName).toBe('writer'));

    const request = http.expectOne(`${environment.apiBaseUrl}/public/SignUp`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ userName: 'writer', email: 'writer@example.com' });
  });

  it('clears the session on logout', () => {
    localStorage.setItem('token', 'token');
    localStorage.setItem('user', 'writer');
    service.logout();
    expect(service.getToken()).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
