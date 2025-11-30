import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  static phoneNumberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const phoneRegex =
        /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
      const isValid = phoneRegex.test(control.value);

      return isValid ? null : { invalidPhoneNumber: true };
    };
  }

  static identityDocumentValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const documentRegex = /^[A-Z0-9]{5,20}$/i;
      const isValid = documentRegex.test(control.value);

      return isValid ? null : { invalidIdentityDocument: true };
    };
  }

  static fullNameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,100}$/;
      const isValid = nameRegex.test(control.value);

      return isValid ? null : { invalidFullName: true };
    };
  }
}
