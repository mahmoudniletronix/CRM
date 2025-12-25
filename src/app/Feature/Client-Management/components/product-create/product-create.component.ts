import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProductsService } from '../../../../Services/products/products.service';
import { Product } from '../../../../Core/domain/models/product.model/product.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProductDetailsDialogComponent } from '../product-details-dialog/product-details-dialog.component';

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './product-create.component.html',
  styleUrl: './product-create.component.css',
})
export class ProductCreateComponent {
  private fb = inject(FormBuilder);
  private productsService = inject(ProductsService);
  private dialog = inject(MatDialog);

  products = signal<Product[]>([]);
  showForm = signal(false);
  submitting = signal(false);

  selectedFile: File | null = null;

  form = this.fb.group({
    nameEn: ['', [Validators.required]],
    nameAr: ['', [Validators.required]],
    descEn: [''],
    descAr: [''],
  });

  constructor() {
    this.loadProducts();
  }

  loadProducts() {
    this.productsService.getProducts().subscribe((data) => {
      this.products.set(data);
    });
  }

  toggleForm() {
    this.showForm.update((v) => !v);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  submit() {
    if (this.form.invalid) return;

    this.submitting.set(true);
    const val = this.form.getRawValue();

    const formData = new FormData();
    formData.append('NameEn', val.nameEn!);
    if (val.nameAr) formData.append('NameAr', val.nameAr);
    if (val.descEn) formData.append('DescriptionEn', val.descEn);
    if (val.descAr) formData.append('DescriptionAr', val.descAr);
    if (this.selectedFile) {
      formData.append('ImagePath', this.selectedFile);
    }

    this.productsService.createProduct(formData).subscribe({
      next: (res) => {
        const newProduct: Product = {
          id: 'new-id',
          nameEn: val.nameEn!,
          nameAr: val.nameAr!,
          descEn: val.descEn || '',
          descAr: val.descAr || '',
          imageUrl: '',
        };
        this.products.update((list) => [...list, newProduct]);

        this.form.reset();
        this.selectedFile = null;
        this.showForm.set(false);
        this.submitting.set(false);
      },
      error: (err) => {
        console.error(err);
        this.submitting.set(false);
      },
    });
  }

  openProductDetails(product: Product) {
    this.dialog.open(ProductDetailsDialogComponent, {
      data: product,
      width: '100%',
      maxWidth: '500px',
      panelClass: 'product-details-dialog-container',
      autoFocus: false,
    });
  }
}
