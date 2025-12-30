import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ToastComponent } from '../../Shared/components/toast/toast.component';

@Injectable({
  providedIn: 'root',
})
export class ToasterService {
  private readonly snackBar = inject(MatSnackBar);

  private readonly defaultConfig: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'end',
    verticalPosition: 'top',
  };

  success(message: string) {
    this.snackBar.openFromComponent(ToastComponent, {
      ...this.defaultConfig,
      data: { message, type: 'success' },
      panelClass: ['transparent-snackbar'],
    });
  }

  error(message: string) {
    this.snackBar.openFromComponent(ToastComponent, {
      ...this.defaultConfig,
      data: { message, type: 'error' },
      panelClass: ['transparent-snackbar'],
    });
  }

  handleApiError(err: any) {
    let message = 'An unexpected error occurred';

    if (err.error) {
      const errorData = err.error;

      // Handle the specific 422 Validation Error structure
      if (errorData.status === 422 && errorData.errors && Array.isArray(errorData.errors)) {
        // Just show the first error message to not clutter the UI
        if (errorData.errors.length > 0) {
          message = errorData.errors[0].message;
        } else if (errorData.detail) {
          message = errorData.detail;
        }
      } else if (errorData.message) {
        // Generic error message
        message = errorData.message;
      } else if (typeof errorData === 'string') {
        message = errorData;
      }
    }

    this.error(message);
  }
}
