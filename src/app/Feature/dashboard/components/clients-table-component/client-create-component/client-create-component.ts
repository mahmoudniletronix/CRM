import { Component, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ClientsService } from '../../../../../Services/clients/clients';
import { AddAccountRequestDto } from '../../../../../Core/domain/models/accountDTO/account-api.models';

@Component({
  selector: 'app-client-create-component',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './client-create-component.html',
  styleUrl: './client-create-component.css',
})
export class ClientCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly clients = inject(ClientsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly errorMsg = signal<string | null>(null);
  readonly successMsg = signal<string | null>(null);
  readonly submitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    accountName: ['', [Validators.required, Validators.minLength(2)]],
    accountNameAr: ['', [Validators.required, Validators.minLength(2)]],
    siteName: ['', [Validators.required, Validators.minLength(2)]],
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10,15}$/)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit(): void {
    this.errorMsg.set(null);
    this.successMsg.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    const v = this.form.getRawValue();

    const dto: AddAccountRequestDto = {
      email: v.email.trim(),
      password: v.password,
      nameEn: v.accountName.trim(),
      nameAr: v.accountNameAr.trim(),
      sites: [
        {
          nameEn: v.siteName.trim(),
          nameAr: v.siteName.trim(),
        },
      ],
    };

    this.clients
      .createAccount(dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.successMsg.set('Client account created successfully.');

          this.form.reset();
          this.submitting.set(false);
        },
        error: (e: Error) => {
          this.errorMsg.set(e.message);
          this.submitting.set(false);
        },
      });
  }
}
