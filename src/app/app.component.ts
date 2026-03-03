import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TermsAndConditionsDialogComponent } from './shared/components/terms-and-conditions-dialog/terms-and-conditions-dialog.component';

const TERMS_ACCEPTED_KEY = 'termsAccepted';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'Project Celerix';

  constructor(private readonly dialog: MatDialog) { }

  ngOnInit(): void {
    // if (typeof window !== 'undefined' && window.localStorage.getItem(TERMS_ACCEPTED_KEY)) {
    //   return;
    // }

    const dialogRef = this.dialog.open(TermsAndConditionsDialogComponent, {
      disableClose: true,
      width: '600px',
      maxWidth: '90vw',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true && typeof window !== 'undefined') {
        window.localStorage.setItem(TERMS_ACCEPTED_KEY, 'true');
      }
    });
  }
}
