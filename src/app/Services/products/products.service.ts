import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, map } from 'rxjs';
import { Product } from '../../Core/domain/models/product.model/product.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/Product`;

  constructor() {}

  // Get Products with image and details
  getProducts(page: number = 1, pageSize: number = 10): Observable<Product[]> {
    return this.http
      .get<any>(`${this.baseUrl}`, {
        params: {
          pageNumber: page,
          pageSize: pageSize,
        },
      })
      .pipe(
        map((response) =>
          response.data.map((item: any) => {
            const rawPath = item.imagePath || '';
            const normalizedPath = rawPath.replace(/\\/g, '/');

            return {
              id: item.id,
              nameEn: item.nameEn,
              nameAr: item.nameAr,
              descEn: item.descriptionEn,
              descAr: item.descriptionAr,
              imageUrl: normalizedPath ? `${environment.apiUrl}/${normalizedPath}` : '',
            };
          })
        )
      );
  }

  // Get Products for Dropdown
  getProductsDropdown(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/GetProducts`);
  }

  // Create Product
  createProduct(data: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/Add`, data);
  }
}
