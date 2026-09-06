import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { Login } from './login';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  const auth = { login: vi.fn() };

  beforeEach(async () => {
    auth.login.mockReset();
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    }).compileComponents();
    fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
  });

  it('shows validation errors and does not submit an empty form', () => {
    fixture.componentInstance.submit();
    fixture.detectChanges();
    expect(auth.login).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelectorAll('.field-error').length).toBe(2);
  });

  it('submits exact credentials and navigates to the journal', () => {
    auth.login.mockReturnValue(of({ token: 'token', userName: 'writer' }));
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    fixture.componentInstance.form.setValue({ userName: 'writer', password: 'secret' });
    fixture.componentInstance.submit();
    expect(auth.login).toHaveBeenCalledWith({ userName: 'writer', password: 'secret' });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/journal');
  });

  it('renders an API error', () => {
    auth.login.mockReturnValue(throwError(() => new Error('offline')));
    fixture.componentInstance.form.setValue({ userName: 'writer', password: 'secret' });
    fixture.componentInstance.submit();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('Something went wrong');
  });
});
