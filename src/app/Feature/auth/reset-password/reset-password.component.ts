import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../../Services/auth/auth';
import { defaultRouteForRole } from '../../../Core/domain/guards/role-routes';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(Auth);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  readonly error = signal<string | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly hidePassword = signal<boolean>(true);

  readonly form = this.fb.nonNullable.group(
    {
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    {
      validators: (group) => {
        const pass = group.get('newPassword')?.value;
        const confirm = group.get('confirmPassword')?.value;
        return pass === confirm ? null : { passwordMismatch: true };
      },
    }
  );

  submit(): void {
    if (this.form.invalid) {
      if (this.form.errors?.['passwordMismatch']) {
        this.error.set('Passwords do not match');
      } else {
        this.error.set('Please fill in all required fields');
      }
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const { oldPassword, newPassword } = this.form.value;

    this.http
      .post(`${environment.apiUrl}/api/Auth/ChangePassword`, {
        oldPassword: oldPassword,
        newPassword: newPassword,
      })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          const target = defaultRouteForRole(this.authService.currentUser()?.role);
          this.router.navigate([target]);
        },
        error: (err: any) => {
          this.isLoading.set(false);
          this.error.set(
            err.error?.message ||
              'Failed to change password. Please check your old password and try again.'
          );
          console.error('Change password error:', err);
        },
      });
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update((v) => !v);
  }
}
