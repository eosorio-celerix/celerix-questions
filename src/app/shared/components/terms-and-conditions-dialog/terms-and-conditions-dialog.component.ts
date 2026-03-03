import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'cx-terms-and-conditions-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
  ],
  templateUrl: './terms-and-conditions-dialog.component.html',
  styleUrls: ['./terms-and-conditions-dialog.component.scss'],
})
export class TermsAndConditionsDialogComponent {
  constructor(
    private readonly dialogRef: MatDialogRef<TermsAndConditionsDialogComponent>
  ) {}

  onAccept(): void {
    this.dialogRef.close(true);
  }
}

