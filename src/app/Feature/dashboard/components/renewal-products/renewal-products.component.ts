import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ToasterService } from '../../../../Services/Toast-message/toaster.service';
import { RenewalService } from '../../../../Services/renewal/renewal.service';
import { RenewalItem } from '../../../../Core/domain/models/RenewalItem/RenewalItem.model';

@Component({
  selector: 'app-renewal-products',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatTabsModule,
    MatPaginatorModule,
    MatButtonToggleModule,
    MatSnackBarModule,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './renewal-products.component.html',
  styleUrls: ['./renewal-products.component.css'],
})
export class RenewalProductsComponent implements OnInit {
  private readonly renewalService = inject(RenewalService);
  private readonly toasterService = inject(ToasterService);

  readonly pendingRenewals = this.renewalService.pendingRenewals;
  readonly renewedProducts = this.renewalService.renewedProducts;
  readonly closedProducts = this.renewalService.closedProducts;
  readonly totalItems = this.renewalService.totalItems;
  readonly totalClosedItems = this.renewalService.totalClosedItems;
  readonly totalRenewedItems = this.renewalService.totalRenewedItems;

  readonly filterDays = signal<number>(30);
  readonly pageSize = signal<number>(10);
  readonly pageIndex = signal<number>(0);

  // Separate pagination for closed products tab
  readonly closedPageSize = signal<number>(10);
  readonly closedPageIndex = signal<number>(0);

  // Separate pagination for monthly renewals tab
  readonly renewedPageSize = signal<number>(10);
  readonly renewedPageIndex = signal<number>(0);

  // Client-side filtering of the CURRENT PAGE data
  readonly filteredPendingRenewals = computed(() => {
    const days = this.filterDays();
    const items = this.pendingRenewals();

    // The API sends items expiring within 30 days.
    // If the user selects 5 or 15, we filter the received batch.
    // Note: Ideally, the API would support filtering, but user instructions imply UI filtering "such that he chooses to display what ends in 5, 15, 30".
    if (days === 30) return items;
    return items.filter((item) => item.daysRemaining <= days);
  });

  readonly displayedColumns: string[] = [
    'accountName',
    'siteName',
    'productName',
    'daysRemaining',
    'supportEndDate',
  ];

  readonly closedProductsColumns: string[] = [
    'accountName',
    'siteName',
    'productName',
    'daysRemaining',
    'supportEndDate',
  ];

  protected readonly Math = Math;

  ngOnInit() {
    this.loadData();
    this.loadClosedData();
    this.loadRenewedData();
  }

  loadData() {
    this.renewalService.loadRenewalProducts(this.pageIndex() + 1, this.pageSize());
  }

  loadClosedData() {
    this.renewalService.loadClosedProducts(this.closedPageIndex() + 1, this.closedPageSize());
  }

  loadRenewedData() {
    this.renewalService.loadMonthlyRenewals(this.renewedPageIndex() + 1, this.renewedPageSize());
  }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadData();
  }

  onClosedPageChange(event: PageEvent) {
    this.closedPageIndex.set(event.pageIndex);
    this.closedPageSize.set(event.pageSize);
    this.loadClosedData();
  }

  onRenewedPageChange(event: PageEvent) {
    this.renewedPageIndex.set(event.pageIndex);
    this.renewedPageSize.set(event.pageSize);
    this.loadRenewedData();
  }

  onFilterChange(days: number) {
    this.filterDays.set(days);
  }

  getDaysStatusClass(days: number): string {
    if (days < 0) return 'expired';
    if (days <= 30) return 'urgent';
    return 'warning';
  }

  onDateChange(item: RenewalItem, event: any) {
    if (event.value) {
      this.renewalService.renewProduct(item, event.value).subscribe({
        next: () => {
          this.toasterService.success('Product renewed successfully');
        },
        error: (err) => {
          console.error('Failed to renew product', err);
          this.toasterService.handleApiError(err);
        },
      });
    }
  }
}
