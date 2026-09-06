import { Component, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { getApiErrorMessage } from '../../../core/http/api-error';
import { AuthService } from '../../../core/services/auth.service';
import { StatusMessage } from '../../../shared/components/status-message/status-message';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  return control.get('password')?.value === control.get('confirmPassword')?.value ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, StatusMessage],
  templateUrl: './register.html',
})
export class Register {
  private readonly auth = inject(AuthService);

  readonly form = new FormGroup(
    {
      userName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3), Validators.maxLength(50)] }),
      email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email, Validators.maxLength(254)] }),
      password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6), Validators.maxLength(72)] }),
      confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    },
    { validators: passwordsMatch },
  );

  submitted = false;
  loading = false;
  showPassword = false;
  errorMessage = '';
  success = false;

  submit(): void {
    this.submitted = true;
    this.errorMessage = '';
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    const { userName, email, password } = this.form.getRawValue();
    this.loading = true;
    this.auth.register({ userName: userName.trim(), email: email.trim(), password }).pipe(finalize(() => (this.loading = false))).subscribe({
      next: () => {
        this.success = true;
        this.form.disable();
      },
      error: (error) => (this.errorMessage = getApiErrorMessage(error)),
    });
  }
}
