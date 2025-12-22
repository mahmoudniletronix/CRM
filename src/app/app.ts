import { Component, signal } from '@angular/core';
import { ShellComponent } from './Core/layout/shell/shell';

@Component({
  selector: 'app-root',
  imports: [ShellComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('CRM');
}
