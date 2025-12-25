import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientCreateComponent } from './components/client-create/client-create-component';
import { ProductCreateComponent } from './components/product-create/product-create.component';
import { ClientsTableComponent } from '../dashboard/components/clients-table-component/clients-table-component';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-client-management',
  standalone: true,
  imports: [
    CommonModule,
    ClientCreateComponent,
    ProductCreateComponent,
    ClientsTableComponent,
    RouterLink,
    MatIconModule,
  ],
  templateUrl: './client-management.component.html',
  styleUrl: './client-management.component.css',
})
export class ClientManagementComponent {}
