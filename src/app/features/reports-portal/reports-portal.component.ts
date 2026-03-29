import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { reportsPortalSecret } from '../../core/config/reports-portal.config';
import { FormService } from '../../core/services/form.service';
import { BiographicReportPdfService } from '../../core/services/biographic-report-pdf.service';
import { UserFormData } from '../../core/models/user-form.model';

@Component({
  selector: 'app-reports-portal',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatTooltipModule,
    FormsModule,
  ],
  templateUrl: './reports-portal.component.html',
  styleUrls: ['./reports-portal.component.scss'],
})
export class ReportsPortalComponent implements OnInit {
  authorized = false;
  loading = false;
  loadError: string | null = null;
  /** Lista completa ordenada (desde DynamoDB). */
  allCandidates: UserFormData[] = [];
  /** Texto de búsqueda por nombre o documento. */
  searchTerm = '';
  displayedColumns: string[] = ['fullName', 'identityDocument', 'email', 'actions'];

  get filteredCandidates(): UserFormData[] {
    const raw = this.searchTerm.trim();
    if (!raw) {
      return this.allCandidates;
    }
    const q = raw.toLowerCase();
    const qDoc = raw.replace(/\s/g, '').toLowerCase();
    return this.allCandidates.filter((row) => {
      const name = (row.fullName || '').toLowerCase();
      const doc = String(row.identityDocument || '')
        .toLowerCase()
        .replace(/\s/g, '');
      return name.includes(q) || doc.includes(qDoc);
    });
  }

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly formService: FormService,
    private readonly biographicReportPdf: BiographicReportPdfService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');
    if (!token || token !== reportsPortalSecret) {
      this.authorized = false;
      void this.router.navigate(['/']);
      return;
    }
    this.authorized = true;
    this.fetchCandidates();
  }

  fetchCandidates(): void {
    this.loading = true;
    this.loadError = null;
    this.formService.listAllCandidates().subscribe({
      next: (rows) => {
        this.loading = false;
        this.allCandidates = this.sortCandidates(rows);
      },
      error: () => {
        this.loading = false;
        this.loadError =
          'No se pudo cargar la lista. Verifica permisos IAM para dynamodb:Scan en la tabla.';
      },
    });
  }

  private sortCandidates(rows: UserFormData[]): UserFormData[] {
    return [...rows].sort((a, b) => {
      const nameA = (a.fullName || '').localeCompare(b.fullName || '', 'es', {
        sensitivity: 'base',
      });
      if (nameA !== 0) return nameA;
      return (a.identityDocument || '').localeCompare(
        b.identityDocument || '',
        'es',
        { numeric: true }
      );
    });
  }

  downloadReport(row: UserFormData): void {
    this.biographicReportPdf.downloadReport(row);
  }
}
