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

@Component({
  selector: 'app-login-component',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(Auth);
  private readonly router = inject(Router);

  readonly error = signal<string | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly hidePassword = signal<boolean>(true);

  constructor() {
    // If already authenticated, redirect to home page immediately
    if (this.authService.isAuthenticated()) {
      this.redirectByRole();
    }
  }

  private redirectByRole(): void {
    const target = defaultRouteForRole(this.authService.currentUser()?.role);
    this.router.navigate([target]);
  }

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.error.set('Please fill in all required fields');
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const { email, password } = this.form.value;

    this.authService.login({ email: email!, password: password! }).subscribe({
      next: () => {
        this.isLoading.set(false);
        const user = this.authService.currentUser();

        if (user?.isFirstLogin) {
          this.router.navigate(['/reset-password']);
          return;
        }

        this.redirectByRole();
      },
      error: (err: any) => {
        this.isLoading.set(false);
        console.error('Login error:', err);

        let errorMessage = 'Login failed. Please try again.';

        if (err.status === 401) {
          errorMessage = 'Invalid email or password';
        } else if (err.status === 0) {
          errorMessage = 'Cannot connect to server. Please check your connection.';
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        }

        this.error.set(errorMessage);
      },
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update((v) => !v);
  }
}
