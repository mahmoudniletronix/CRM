import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CreateTicketDto, TicketPriority } from '../../../../Core/domain/models/ticket.model';

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './ticket-form.component.html',
  styleUrls: ['./ticket-form.component.css'],
})
export class TicketFormComponent {
  ticketCreated = output<CreateTicketDto>();

  ticketForm: FormGroup;
  isSubmitting = false;
  showSuccess = false;

  priorities = [
    { value: TicketPriority.Low, label: 'Low', icon: 'arrow_downward', color: '#10b981' },
    { value: TicketPriority.Medium, label: 'Medium', icon: 'remove', color: '#f59e0b' },
    { value: TicketPriority.High, label: 'High', icon: 'arrow_upward', color: '#ef4444' },
    { value: TicketPriority.Urgent, label: 'Urgent', icon: 'priority_high', color: '#dc2626' },
  ];

  constructor(private fb: FormBuilder) {
    this.ticketForm = this.fb.group({
      subject: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[\d\s\+\-\(\)]+$/)]],
      priority: [TicketPriority.Medium],
    });
  }

  onSubmit(): void {
    if (this.ticketForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const dto: CreateTicketDto = this.ticketForm.value;

      // Simulate API call delay
      setTimeout(() => {
        this.ticketCreated.emit(dto);
        this.showSuccess = true;
        this.ticketForm.reset({ priority: TicketPriority.Medium });
        this.isSubmitting = false;

        // Hide success message after 3 seconds
        setTimeout(() => {
          this.showSuccess = false;
        }, 3000);
      }, 500);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.ticketForm.controls).forEach((key) => {
        this.ticketForm.get(key)?.markAsTouched();
      });
    }
  }

  getErrorMessage(fieldName: string): string {
    const field = this.ticketForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'This field is required';
    }
    if (field?.hasError('email')) {
      return 'Please enter a valid email';
    }
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Minimum ${minLength} characters required`;
    }
    if (field?.hasError('pattern')) {
      return 'Please enter a valid phone number';
    }
    return '';
  }
}
