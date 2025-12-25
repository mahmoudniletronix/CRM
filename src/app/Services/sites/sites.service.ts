import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { Site, SitesResponse } from '../../Core/domain/models/site.model/site.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SitesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/Site`;

  sites = signal<Site[]>([]);

  getSites(page: number = 1, pageSize: number = 10): Observable<Site[]> {
    return this.http
      .get<SitesResponse>(`${this.baseUrl}`, {
        params: {
          pageNumber: page,
          pageSize: pageSize,
        },
      })
      .pipe(
        map((response) =>
          response.data.map((site) => ({
            ...site,
            products: site.products.map((product) => ({
              ...product,
              productImage: product.productImage
                ? `${environment.apiUrl}/${product.productImage.replace(/\\/g, '/')}`
                : '',
            })),
            tickets: site.tickets.map((ticket) => ({
              ...ticket,
              attachments: ticket.attachments.map((attachment) => ({
                ...attachment,
                url: `${environment.apiUrl}/${attachment.url.replace(/\\/g, '/')}`,
              })),
            })),
          }))
        ),
        tap((sites) => this.sites.set(sites))
      );
  }

  getSuperAdminSites(page: number = 1, pageSize: number = 10): Observable<SitesResponse> {
    return this.http
      .get<SitesResponse>(`${this.baseUrl}/GetSuperAdminSites`, {
        params: {
          pageNumber: page,
          pageSize: pageSize,
        },
      })
      .pipe(
        map((response) => ({
          ...response,
          data: response.data.map((site) => ({
            ...site,
            products: site.products.map((product) => ({
              ...product,
              productImage: product.productImage
                ? `${environment.apiUrl}/${product.productImage.replace(/\\/g, '/')}`
                : '',
            })),
            tickets: site.tickets.map((ticket) => ({
              ...ticket,
              attachments: ticket.attachments.map((attachment) => ({
                ...attachment,
                url: `${environment.apiUrl}/${attachment.url.replace(/\\/g, '/')}`,
              })),
            })),
          })),
        }))
      );
  }
}
