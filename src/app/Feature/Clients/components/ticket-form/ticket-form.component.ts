import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { TicketsService } from '../../../../Services/tickets/tickets.service';
import { SitesService } from '../../../../Services/sites/sites.service';
import { ProductsService } from '../../../../Services/products/products.service';
import { Auth } from '../../../../Services/auth/auth';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

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
  ticketCreated = output<any>();

  private fb = inject(FormBuilder);
  private ticketsService = inject(TicketsService);
  private productsService = inject(ProductsService);
  private sitesService = inject(SitesService); // Inject SitesService
  private auth = inject(Auth);
  private http = inject(HttpClient);

  ticketForm: FormGroup;
  readonly isSubmitting = this.ticketsService.isSubmitting;
  showSuccess = false;

  products = signal<any[]>([]);
  sites = signal<any[]>([]);
  selectedFiles = signal<File[]>([]);

  private readonly defaultSeverity = 1;

  constructor() {
    this.ticketForm = this.fb.group({
      subject: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[\d\s\+\-\(\)]+$/)]],
      productId: ['', [Validators.required]],
      siteId: ['', [Validators.required]],
    });

    this.loadProducts();
    this.loadSites();
  }

  loadProducts() {
    this.productsService.getProductsDropdown().subscribe({
      next: (data) => this.products.set(data),
      error: (err) => console.error('Failed to load products', err),
    });
  }

  loadSites() {
    this.sitesService.getSites().subscribe({
      next: (sites) => {
        this.sites.set(sites);
        if (sites.length > 0 && !this.ticketForm.get('siteId')?.value) {
          this.ticketForm.patchValue({ siteId: sites[0].id });
        }
      },
      error: (err) => console.error('Failed to load sites', err),
    });
  }

  onSubmit(): void {
    if (this.ticketForm.valid && !this.isSubmitting()) {
      const formVal = this.ticketForm.value;

      const payload: any = {
        subject: formVal.subject,
        description: formVal.description,
        email: formVal.email,
        phoneNumber: formVal.phone,
        severity: this.defaultSeverity,
        productId: formVal.productId,
        siteId: formVal.siteId,
        attachments: this.selectedFiles(),
      };

      this.ticketsService.createTicket(payload).subscribe({
        next: (res) => {
          console.log(res);
          this.ticketCreated.emit(res);
          this.showSuccess = true;

          this.selectedFiles.set([]);
          this.ticketForm.reset({
            siteId: this.sites()[0]?.id || '',
          });

          setTimeout(() => (this.showSuccess = false), 3000);
        },
        error: (err) => {
          console.error('Create ticket failed', err);
        },
      });
    } else {
      console.log('Form Invalid:', this.ticketForm.errors);
      Object.keys(this.ticketForm.controls).forEach((key) => {
        const control = this.ticketForm.get(key);
        if (control?.invalid) {
          console.log(key, control.errors);
        }
      });
      this.ticketForm.markAllAsTouched();
    }
  }

  onReset(): void {
    this.selectedFiles.set([]);
    this.ticketForm.reset({
      siteId: this.sites()[0]?.id || '',
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const filesArray = Array.from(input.files);

      const maxSize = 5 * 1024 * 1024; // 5MB
      const validFiles = filesArray.filter((file) => {
        if (file.size > maxSize) {
          console.warn(`File ${file.name} exceeds 5MB limit`);
          return false;
        }
        return true;
      });

      this.selectedFiles.update((existing) => [...existing, ...validFiles]);
      input.value = '';
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.update((files) => files.filter((_, i) => i !== index));
  }

  getFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  getErrorMessage(fieldName: string): string {
    const field = this.ticketForm.get(fieldName);
    if (field?.hasError('required')) return 'This field is required';
    if (field?.hasError('email')) return 'Please enter a valid email';
    if (field?.hasError('minlength'))
      return `Minimum ${field.errors?.['minlength'].requiredLength} characters required`;
    if (field?.hasError('pattern')) return 'Please enter a valid phone number';
    return '';
  }
}
