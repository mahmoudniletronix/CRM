import { Component, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ClientsService } from '../../../../Services/clients/clients';
import {
  AddAccountRequestDto,
  ProductSupportDto,
} from '../../../../Core/domain/models/accountDTO/account-api.models';
import { ProductsService } from '../../../../Services/products/products.service';
import { Product } from '../../../../Core/domain/models/product.model/product.model';

@Component({
  selector: 'app-client-create-component',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './client-create-component.html',
  styleUrl: './client-create-component.css',
})
export class ClientCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly clients = inject(ClientsService);
  private readonly productsService = inject(ProductsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly errorMsg = signal<string | null>(null);
  readonly successMsg = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly availableProducts = signal<Product[]>([]);

  readonly form = this.fb.group({
    nameEn: ['', [Validators.required, Validators.minLength(2)]],
    nameAr: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    sites: this.fb.array([this.createSiteGroup()]),
  });

  constructor() {
    this.loadProducts();
  }

  loadProducts() {
    this.productsService
      .getProducts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((products) => this.availableProducts.set(products));
  }

  createSiteGroup() {
    return this.fb.group({
      nameEn: ['', [Validators.required]],
      nameAr: ['', [Validators.required]],
      products: this.fb.array([]),
    });
  }

  createProductGroup(productId: string = '') {
    return this.fb.group({
      productId: [productId, [Validators.required]],
      supportEndDate: [new Date().toISOString(), [Validators.required]], // Default to today or handle valid date
    });
  }

  get sites() {
    return this.form.controls.sites as FormArray;
  }

  getProductsArray(siteIndex: number): FormArray {
    return this.sites.at(siteIndex).get('products') as FormArray;
  }

  addSite() {
    this.sites.push(this.createSiteGroup());
  }

  removeSite(index: number) {
    if (this.sites.length > 1) {
      this.sites.removeAt(index);
    }
  }

  addProductToSite(siteIndex: number) {
    const productsArray = this.getProductsArray(siteIndex);
    productsArray.push(this.createProductGroup());
  }

  removeProductFromSite(siteIndex: number, productIndex: number) {
    const productsArray = this.getProductsArray(siteIndex);
    productsArray.removeAt(productIndex);
  }

  submit(): void {
    this.errorMsg.set(null);
    this.successMsg.set(null);

    // Basic validation check
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    const v = this.form.getRawValue();

    // Map the form value to the expected DTO
    const dto: AddAccountRequestDto = {
      email: v.email!.trim(),
      password: v.password!,
      nameEn: v.nameEn!.trim(),
      nameAr: v.nameAr!.trim(),
      sites: v.sites!.map((s: any) => ({
        nameEn: s.nameEn!,
        nameAr: s.nameAr!,
        products:
          s.products?.map((p: any) => ({
            productId: p.productId,
            supportEndDate: new Date(p.supportEndDate).toISOString(),
          })) || [],
      })),
    };

    this.clients
      .createAccount(dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.successMsg.set('Client account created successfully.');
          this.form.reset();
          // Reset arrays to initial state
          this.sites.clear();
          this.sites.push(this.createSiteGroup());
          this.submitting.set(false);
        },
        error: (e: Error) => {
          this.errorMsg.set(e.message || 'Failed to create client');
          this.submitting.set(false);
        },
      });
  }
}
