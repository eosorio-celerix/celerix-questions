import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { UserFormData } from '../models/user-form.model';

@Injectable({
  providedIn: 'root'
})
export class FormService {
  private formData: UserFormData | null = null;

  saveFormData(data: UserFormData): Observable<UserFormData> {
    this.formData = { ...data };
    // In a real application, this would make an HTTP call to save the data
    return of(this.formData);
  }

  getFormData(): UserFormData | null {
    return this.formData;
  }

  clearFormData(): void {
    this.formData = null;
  }
}

