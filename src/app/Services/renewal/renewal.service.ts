import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RenewalApiResponse } from '../../Core/domain/models/RenewalResponse.model';
import { RenewalItem } from '../../Core/domain/models/RenewalItem/RenewalItem.model';

@Injectable({
  providedIn: 'root',
})
export class RenewalService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl + '/api/Product/GetProductEndedWithin30Days';
  private readonly closedProductsUrl = environment.apiUrl + '/api/Product/GetClosedProducts';

  private readonly _pendingRenewals = signal<RenewalItem[]>([]);
  private readonly _renewedProducts = signal<RenewalItem[]>([]);
  private readonly _closedProducts = signal<RenewalItem[]>([]);
  private readonly _totalItems = signal<number>(0);
  private readonly _totalClosedItems = signal<number>(0);

  readonly pendingRenewals = this._pendingRenewals.asReadonly();
  readonly renewedProducts = this._renewedProducts.asReadonly();
  readonly closedProducts = this._closedProducts.asReadonly();
  readonly totalItems = this._totalItems.asReadonly();
  readonly totalClosedItems = this._totalClosedItems.asReadonly();

  loadRenewalProducts(pageNumber: number = 1, pageSize: number = 10): void {
    let params = new HttpParams().set('PageNumber', pageNumber).set('PageSize', pageSize);

    this.http.get<RenewalApiResponse>(this.apiUrl, { params }).subscribe({
      next: (response) => {
        const items: RenewalItem[] = (response.data || []).map((dto) => {
          const endDate = new Date(dto.endDate);
          const today = new Date();
          const timeDiff = endDate.getTime() - today.getTime();
          const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

          return {
            id: dto.siteProductId,
            accountName: dto.accountNameEn,
            siteName: dto.siteNameEn,
            productName: dto.productNameEn,
            supportEndDate: endDate,
            daysRemaining: daysRemaining,
          };
        });

        // The API returns expiring within 30 days. We accept them all.
        // Client-side filtering for 5/15 days can happen in the component if desired,
        // or we just show what the page gives us.
        this._pendingRenewals.set(items);
        this._totalItems.set(response.totalItems);
      },
      error: (err) => console.error('Failed to load renewal products', err),
    });
  }

  private readonly monthlyRenewalsUrl = environment.apiUrl + '/api/Product/GetRenewProductMonthly';

  private readonly _totalRenewedItems = signal<number>(0);

  readonly totalRenewedItems = this._totalRenewedItems.asReadonly();

  loadMonthlyRenewals(pageNumber: number = 1, pageSize: number = 10): void {
    let params = new HttpParams().set('PageNumber', pageNumber).set('PageSize', pageSize);

    this.http.get<RenewalApiResponse>(this.monthlyRenewalsUrl, { params }).subscribe({
      next: (response) => {
        const items: RenewalItem[] = (response.data || []).map((dto) => {
          const endDate = new Date(dto.endDate);
          const today = new Date();
          const timeDiff = endDate.getTime() - today.getTime();
          const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

          return {
            id: dto.siteProductId,
            accountName: dto.accountNameEn,
            siteName: dto.siteNameEn,
            productName: dto.productNameEn,
            supportEndDate: endDate,
            daysRemaining: daysRemaining,
          };
        });

        this._renewedProducts.set(items);
        this._totalRenewedItems.set(response.totalItems);
      },
      error: (err) => console.error('Failed to load monthly renewed products', err),
    });
  }

  loadClosedProducts(pageNumber: number = 1, pageSize: number = 10): void {
    let params = new HttpParams().set('PageNumber', pageNumber).set('PageSize', pageSize);

    this.http.get<RenewalApiResponse>(this.closedProductsUrl, { params }).subscribe({
      next: (response) => {
        const items: RenewalItem[] = (response.data || []).map((dto) => {
          const endDate = new Date(dto.endDate);
          const today = new Date();
          const timeDiff = endDate.getTime() - today.getTime();
          const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

          return {
            id: dto.siteProductId,
            accountName: dto.accountNameEn,
            siteName: dto.siteNameEn,
            productName: dto.productNameEn,
            supportEndDate: endDate,
            daysRemaining: daysRemaining,
          };
        });

        this._closedProducts.set(items);
        this._totalClosedItems.set(response.totalItems);
      },
      error: (err) => console.error('Failed to load closed products', err),
    });
  }

  renewProduct(item: RenewalItem, newDate: Date): Observable<any> {
    const url = `${environment.apiUrl}/api/Product/RenewProduct`;
    const body = {
      siteProductId: item.id,
      renewalDate: newDate.toISOString(),
    };

    return this.http.post(url, body).pipe(
      tap(() => {
        // Update local object
        item.supportEndDate = newDate;

        // Recalculate days remaining
        const today = new Date();
        const timeDiff = newDate.getTime() - today.getTime();
        item.daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

        // 1. Remove from Pending if exists
        this._pendingRenewals.update((prev) => {
          const next = prev.filter((i) => i.id !== item.id);
          if (next.length < prev.length) {
            this._totalItems.update((c) => Math.max(0, c - 1));
          }
          return next;
        });

        this._closedProducts.update((prev) => {
          const next = prev.filter((i) => i.id !== item.id);
          if (next.length < prev.length) {
            this._totalClosedItems.update((c) => Math.max(0, c - 1));
          }
          return next;
        });

        this._renewedProducts.update((prev) => {
          const filtered = prev.filter((i) => i.id !== item.id);

          if (filtered.length === prev.length) {
            this._totalRenewedItems.update((c) => c + 1);
          }

          return [item, ...filtered];
        });
      })
    );
  }
}
