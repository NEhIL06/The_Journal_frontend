import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { Register } from './register';

describe('Register', () => {
  let fixture: ComponentFixture<Register>;
  const auth = { register: vi.fn() };

  beforeEach(async () => {
    auth.register.mockReset();
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    }).compileComponents();
    fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
  });

  it('rejects mismatched passwords without calling the API', () => {
    fixture.componentInstance.form.setValue({
      userName: 'writer',
      email: 'writer@example.com',
      password: 'secret1',
      confirmPassword: 'secret2',
    });

    fixture.componentInstance.submit();
    fixture.detectChanges();

    expect(auth.register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.field-error')?.textContent).toContain('Passwords must match');
  });

  it('submits the backend registration contract and displays success', () => {
    auth.register.mockReturnValue(of({ userName: 'writer', email: 'writer@example.com' }));
    fixture.componentInstance.form.setValue({
      userName: ' writer ',
      email: 'writer@example.com',
      password: 'secret1',
      confirmPassword: 'secret1',
    });

    fixture.componentInstance.submit();
    fixture.detectChanges();

    expect(auth.register).toHaveBeenCalledWith({
      userName: 'writer',
      email: 'writer@example.com',
      password: 'secret1',
    });
    expect(fixture.nativeElement.querySelector('[role="status"]')?.textContent).toContain('account is ready');
  });
});
