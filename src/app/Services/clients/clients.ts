import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AddAccountRequestDto,
  PagedResponse,
  AccountDto,
} from '../../Core/domain/models/accountDTO/account-api.models';
import { ApiResponse } from '../../Core/domain/models/api-response/api-response.models';
import { Client } from '../../Core/domain/models/client.models/client.models';

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private readonly http = inject(HttpClient);

  private readonly _clients = signal<Client[]>(this.seed());
  readonly clients = this._clients.asReadonly();

  createAccount(dto: AddAccountRequestDto) {
    return this.http.post<ApiResponse<unknown>>(`${environment.apiUrl}/api/Account/Add`, dto).pipe(
      map((res) => {
        if (!res?.isSuccess) {
          const msg = res?.errors?.[0]?.message ?? 'Create account failed.';
          throw new Error(msg);
        }

        return res;
      }),
      catchError((err: unknown) => throwError(() => this.normalizeError(err)))
    );
  }

  getAccounts(page: number, pageSize: number) {
    return this.http.get<PagedResponse<AccountDto>>(`${environment.apiUrl}/api/Account/GetAll`, {
      params: {
        PageNumber: page,
        PageSize: pageSize,
      },
    });
  }

  deleteClient(id: number): void {
    this._clients.update((prev) => prev.filter((c) => c.id !== id));
  }

  private normalizeError(err: unknown): Error {
    if (err instanceof Error) return err;

    if (err instanceof HttpErrorResponse) {
      const body: any = err.error;
      const serverMsg =
        body?.errors?.[0]?.message ||
        body?.message ||
        body?.title ||
        `Request failed (${err.status})`;
      return new Error(serverMsg);
    }

    return new Error('Unexpected error occurred.');
  }

  private seed(): Client[] {
    return [
      {
        id: 1,
        accountName: 'Acme Corp',
        siteName: 'Cairo Downtown',
        name: 'Ahmed Mohamed',
        email: 'client1@example.com',
        phoneNumber: '0100123456',
        status: 'active' as const,
        ticketStats: { pending: 2, assigned: 1, closed: 3 },
      },
      {
        id: 2,
        accountName: 'Global Solutions',
        siteName: 'Giza - Dokki',
        name: 'Fatma Ali',
        email: 'client2@example.com',
        phoneNumber: '01111111111',
        status: 'inactive' as const,
        ticketStats: { pending: 1, assigned: 0, closed: 4 },
      },
    ];
  }
}
