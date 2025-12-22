import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header';
import { FooterComponent } from '../footer/footer';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-shell',
  standalone: true,
  templateUrl: './shell.html',
  styleUrls: ['./shell.css'],
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
})
export class ShellComponent {
  hideLayout = false;

  private readonly noLayoutRoutes = ['/login'];

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.hideLayout = this.noLayoutRoutes.some((route) =>
          event.urlAfterRedirects.startsWith(route)
        );
      });
  }
}
