import { CommonModule } from '@angular/common';
import { Component, inject, signal, afterNextRender } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ClientsService } from '../../../../Services/clients/clients';
import { AccountDto } from '../../../../Core/domain/models/accountDTO/account-api.models';

@Component({
  selector: 'app-clients-table-component',
  imports: [CommonModule, MatTableModule, MatButtonModule, MatPaginatorModule],
  templateUrl: './clients-table-component.html',
  styleUrl: './clients-table-component.css',
})
export class ClientsTableComponent {
  private readonly clientsService = inject(ClientsService);

  readonly accounts = signal<AccountDto[]>([]);
  readonly totalItems = signal(0);
  readonly pageSize = signal(10);
  readonly pageIndex = signal(0);

  readonly displayedColumns: string[] = ['nameEn', 'nameAr', 'sites'];

  constructor() {
    afterNextRender(() => {
      this.loadAccounts();
    });
  }

  loadAccounts() {
    this.clientsService.getAccounts(this.pageIndex() + 1, this.pageSize()).subscribe((res) => {
      this.accounts.set(res.data);
      this.totalItems.set(res.totalItems);
    });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadAccounts();
  }
}
