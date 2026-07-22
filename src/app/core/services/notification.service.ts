import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/** Thin wrapper around MatSnackBar for consistent toasts across the app. */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string): void {
    this.open(message, 'toast-success');
  }

  error(message: string): void {
    this.open(message, 'toast-error');
  }

  info(message: string): void {
    this.open(message, 'toast-info');
  }

  private open(message: string, panelClass: string): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: 3500,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: [panelClass],
    });
  }
}
