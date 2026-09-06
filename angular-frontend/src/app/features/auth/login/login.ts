import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { getApiErrorMessage } from '../../../core/http/api-error';
import { AuthService } from '../../../core/services/auth.service';
import { StatusMessage } from '../../../shared/components/status-message/status-message';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, StatusMessage],
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly form = new FormGroup({
    userName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(50)] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  submitted = false;
  loading = false;
  showPassword = false;
  errorMessage = '';
  readonly sessionExpired = this.route.snapshot.queryParamMap.get('sessionExpired') === 'true';

  submit(): void {
    this.submitted = true;
    this.errorMessage = '';
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.auth.login(this.form.getRawValue()).pipe(finalize(() => (this.loading = false))).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        void this.router.navigateByUrl(returnUrl?.startsWith('/') ? returnUrl : '/journal');
      },
      error: (error) => (this.errorMessage = getApiErrorMessage(error)),
    });
  }
}
