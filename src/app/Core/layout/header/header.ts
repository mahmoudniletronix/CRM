import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { Auth } from '../../../Services/auth/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
  imports: [CommonModule, MatMenuModule, MatIconModule, MatDividerModule, MatButtonModule],
})
export class HeaderComponent {
  private readonly authService = inject(Auth);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.currentUser;

  getUserInitials(): string {
    const user = this.currentUser();
    if (!user?.fullName) return 'U';

    const names = user.fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
