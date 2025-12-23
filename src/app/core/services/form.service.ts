import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { UserFormData } from '../models/user-form.model';
import { DynamoDBService } from './dynamodb.service';

@Injectable({
  providedIn: 'root',
})
export class FormService {
  private formData: UserFormData | null = null;

  constructor(private dynamoDBService: DynamoDBService) {}

  searchFormByIdentityDocument(
    identityDocument: string
  ): Observable<UserFormData | null> {
    return this.dynamoDBService.getFormByIdentityDocument(identityDocument);
  }

  saveFormData(data: UserFormData): Observable<UserFormData> {
    this.formData = { ...data };
    return this.dynamoDBService.saveForm(data);
  }

  getFormData(): UserFormData | null {
    return this.formData;
  }

  clearFormData(): void {
    this.formData = null;
  }
}

