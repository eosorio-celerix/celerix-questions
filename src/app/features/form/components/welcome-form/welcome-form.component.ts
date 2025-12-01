import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  ValidationErrors,
} from '@angular/forms';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import {
  MatNativeDateModule,
  MAT_DATE_FORMATS,
  DateAdapter,
} from '@angular/material/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CustomDateAdapter } from '../../../../core/adapters/custom-date.adapter';
import { CustomValidators } from '../../../../core/validators/custom.validators';
import { FormService } from '../../../../core/services/form.service';
import {
  CountryService,
  Country,
} from '../../../../core/services/country.service';
import { UserFormData } from '../../../../core/models/user-form.model';

@Component({
  selector: 'app-welcome-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatRadioModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
  ],
  providers: [
    DatePipe,
    { provide: DateAdapter, useClass: CustomDateAdapter },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: 'DD MMM YYYY',
        },
        display: {
          dateInput: 'DD MMM YYYY',
          monthYearLabel: 'MMM YYYY',
          dateA11yLabel: 'LL',
          monthYearA11yLabel: 'MMMM YYYY',
        },
      },
    },
  ],
  templateUrl: './welcome-form.component.html',
  styleUrls: ['./welcome-form.component.scss'],
})
export class WelcomeFormComponent implements OnInit {
  personalInfoForm: FormGroup;
  professionalInfoForm: FormGroup;
  additionalInfoForm: FormGroup;
  energyScenarioForm: FormGroup;
  answerQuestionForm: FormGroup;
  isSubmitting = false;

  energyAspects = ['Aspect 1', 'Aspect 2', 'Aspect 3', 'Aspect 4'];

  scenarioOptions = [
    { value: 'public', label: 'A. ¿Corriges en público?' },
    { value: 'private', label: 'B. ¿Esperas a discutirlo en privado?' },
    {
      value: 'other',
      label: 'C. ¿Buscas otra manera de abordar el problema?',
    },
  ];

  countries = [
    'United States',
    'Canada',
    'Mexico',
    'Colombia',
    'Argentina',
    'Brazil',
    'Chile',
    'Peru',
    'Spain',
    'United Kingdom',
    'France',
    'Germany',
    'Italy',
    'Other',
  ];

  languageLevels = ['Básico', 'Intermedio', 'Avanzado'];

  phoneCountries: Country[] = [];
  selectedPhoneCountry: Country | null = null;
  showCountryDropdown = false;

  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private datePipe: DatePipe,
    private countryService: CountryService
  ) {
    this.personalInfoForm = this.createPersonalInfoForm();
    this.professionalInfoForm = this.createProfessionalInfoForm();
    this.additionalInfoForm = this.createAdditionalInfoForm();
    this.energyScenarioForm = this.createEnergyScenarioForm();
    this.answerQuestionForm = this.createAnswerQuestionForm();
  }

  ngOnInit(): void {
    // Load countries from API
    this.countryService.getCountriesForPhone().subscribe((countries) => {
      this.phoneCountries = countries;

      // Set default to Colombia if available, otherwise first country
      const colombia = countries.find((c) => c.code === '+57');
      this.selectedPhoneCountry = colombia || countries[0] || null;

      if (this.selectedPhoneCountry) {
        this.personalInfoForm.patchValue({
          phoneCountryCode: this.selectedPhoneCountry.code,
        });
      }

      // Restore selected country if saved
      const savedData = this.formService.getFormData();
      if (savedData?.phoneCountryCode) {
        const savedCountry = countries.find(
          (c) => c.code === savedData.phoneCountryCode
        );
        if (savedCountry) {
          this.selectedPhoneCountry = savedCountry;
          this.personalInfoForm.patchValue({
            phoneCountryCode: savedCountry.code,
          });
        }
      }
    });

    const savedData = this.formService.getFormData();
    if (savedData) {
      this.personalInfoForm.patchValue(savedData);
      this.professionalInfoForm.patchValue(savedData);
      this.additionalInfoForm.patchValue(savedData);
      this.energyScenarioForm.patchValue(savedData);
      this.answerQuestionForm.patchValue(savedData);
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (event: any) => {
      if (!event.target.closest('.phone-country-selector')) {
        this.showCountryDropdown = false;
      }
    });

    // Update percentage validation when any energy field changes
    const energyFields = [
      'energyAspect1',
      'energyAspect2',
      'energyAspect3',
      'energyAspect4',
    ];
    energyFields.forEach((field) => {
      this.energyScenarioForm.get(field)?.valueChanges.subscribe(() => {
        energyFields.forEach((f) => {
          const control = this.energyScenarioForm.get(f);
          if (control) {
            control.updateValueAndValidity({ emitEvent: false });
          }
        });
      });
    });

    // Conditional validation for otherLanguageLevel
    this.professionalInfoForm
      .get('otherLanguage')
      ?.valueChanges.subscribe((value) => {
        const otherLanguageLevelControl =
          this.professionalInfoForm.get('otherLanguageLevel');
        if (value && value.toLowerCase() === 'no') {
          otherLanguageLevelControl?.clearValidators();
          otherLanguageLevelControl?.setValue('');
        } else if (value && value.toLowerCase() !== 'no') {
          otherLanguageLevelControl?.setValidators([Validators.required]);
        }
        otherLanguageLevelControl?.updateValueAndValidity();
      });
  }

  private createPersonalInfoForm(): FormGroup {
    return this.fb.group({
      fullName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          CustomValidators.fullNameValidator(),
        ],
      ],
      identityDocument: [
        '',
        [Validators.required, CustomValidators.identityDocumentValidator()],
      ],
      birthDate: ['', [Validators.required]],
      birthPlace: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      country: ['', [Validators.required]],
      phoneNumber: [
        '',
        [Validators.required, CustomValidators.phoneNumberValidator()],
      ],
      phoneCountryCode: ['+57', [Validators.required]], // Default to Colombia
    });
  }

  private createProfessionalInfoForm(): FormGroup {
    return this.fb.group({
      // Professional History
      school: ['', [Validators.required, Validators.minLength(2)]],
      degree: ['', [Validators.required, Validators.minLength(2)]],

      // Work Experience
      company: ['', [Validators.required, Validators.minLength(2)]],
      position: ['', [Validators.required, Validators.minLength(2)]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      immediateLeader: ['', [Validators.required, Validators.minLength(2)]],
      mainResponsibilities: [
        '',
        [Validators.required, Validators.minLength(10)],
      ],
      achievements: ['', [Validators.required, Validators.minLength(10)]],
      whyCloseCycle: ['', [Validators.required, Validators.minLength(10)]],

      // Languages
      englishLevel: ['', [Validators.required]],
      englishLearningPlace: [
        '',
        [Validators.required, Validators.minLength(2)],
      ],
      otherLanguage: ['', [Validators.required]],
      otherLanguageLevel: [''],
    });
  }

  private createAdditionalInfoForm(): FormGroup {
    return this.fb.group({
      preferredName: ['', [Validators.required, Validators.minLength(2)]],
      superpowerAndKryptonite: [
        '',
        [Validators.required, Validators.minLength(10)],
      ],
      whatCaughtAttention: [
        '',
        [Validators.required, Validators.minLength(10)],
      ],
      uniqueWorkStyle: ['', [Validators.required, Validators.minLength(10)]],
      questionForCandidates: [
        '',
        [Validators.required, Validators.minLength(10)],
      ],
    });
  }

  private createEnergyScenarioForm(): FormGroup {
    return this.fb.group({
      energyAspect1: [
        '',
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      energyAspect2: [
        '',
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      energyAspect3: [
        '',
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      energyAspect4: [
        '',
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      scenarioAction: ['', [Validators.required]],
      scenarioExplanation: [
        '',
        [Validators.required, Validators.minLength(10)],
      ],
    });
  }

  private createAnswerQuestionForm(): FormGroup {
    return this.fb.group({
      answerToOwnQuestion: [
        '',
        [Validators.required, Validators.minLength(10)],
      ],
    });
  }

  getErrorMessage(
    fieldName: string,
    formGroup: FormGroup = this.personalInfoForm
  ): string {
    const control = formGroup.get(fieldName);

    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return `${this.getFieldLabel(fieldName)} es requerido`;
    }

    if (control.errors['email']) {
      return 'Por favor ingresa un correo electrónico válido';
    }

    if (control.errors['minlength']) {
      return `${this.getFieldLabel(fieldName)} debe tener al menos ${
        control.errors['minlength'].requiredLength
      } caracteres`;
    }

    if (control.errors['invalidPhoneNumber']) {
      return 'Por favor ingresa un número de teléfono válido';
    }

    if (control.errors['invalidIdentityDocument']) {
      return 'Por favor ingresa un documento de identidad válido';
    }

    if (control.errors['invalidFullName']) {
      return 'Por favor ingresa un nombre completo válido';
    }

    if (control.errors['min'] || control.errors['max']) {
      return 'El porcentaje debe estar entre 0 y 100';
    }

    return 'Valor inválido';
  }

  getEnergyPercentageSum(): number {
    const aspect1 = parseFloat(
      this.energyScenarioForm.get('energyAspect1')?.value || '0'
    );
    const aspect2 = parseFloat(
      this.energyScenarioForm.get('energyAspect2')?.value || '0'
    );
    const aspect3 = parseFloat(
      this.energyScenarioForm.get('energyAspect3')?.value || '0'
    );
    const aspect4 = parseFloat(
      this.energyScenarioForm.get('energyAspect4')?.value || '0'
    );
    return aspect1 + aspect2 + aspect3 + aspect4;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      fullName: 'Nombre completo',
      identityDocument: 'Documento de identidad',
      birthDate: 'Fecha de nacimiento',
      birthPlace: 'Lugar de nacimiento',
      email: 'Correo electrónico',
      city: 'Ciudad',
      country: 'País',
      phoneNumber: 'Número de teléfono',
      school: 'Colegio',
      degree: 'Pregrado / Postgrado / Maestría',
      company: 'Empresa',
      position: 'Cargo',
      startDate: 'Fecha de inicio',
      endDate: 'Fecha de finalización',
      immediateLeader: 'Líder inmediato',
      mainResponsibilities: 'Principales responsabilidades',
      achievements: 'Logros que te enorgullecen',
      whyCloseCycle: '¿Por qué decidiste cerrar ese ciclo?',
      englishLevel: 'Nivel de inglés',
      englishLearningPlace: '¿Dónde aprendiste?',
      otherLanguage: '¿Otro idioma?',
      otherLanguageLevel: 'Nivel de otro idioma',
      preferredName: '¿Cómo te gustaría que te llamen?',
      superpowerAndKryptonite: 'Superpoder y kryptonita',
      whatCaughtAttention: '¿Qué te atrajo más sobre esta oportunidad?',
      uniqueWorkStyle: 'Estilo de trabajo único',
      questionForCandidates: 'Pregunta para candidatos',
      energyAspect1: 'Aspecto de energía 1',
      energyAspect2: 'Aspecto de energía 2',
      energyAspect3: 'Aspecto de energía 3',
      energyAspect4: 'Aspecto de energía 4',
      scenarioAction: 'Acción del escenario',
      scenarioExplanation: 'Explicación del escenario',
      answerToOwnQuestion: 'Respuesta a tu propia pregunta',
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(
    fieldName: string,
    formGroup: FormGroup = this.personalInfoForm
  ): boolean {
    const control = formGroup.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  onSubmit(
    stepper: MatStepper,
    formGroup: FormGroup = this.personalInfoForm
  ): void {
    if (formGroup.valid) {
      this.isSubmitting = true;
      const formData: UserFormData = {
        ...this.personalInfoForm.value,
        ...this.professionalInfoForm.value,
        ...this.additionalInfoForm.value,
        ...this.energyScenarioForm.value,
        ...this.answerQuestionForm.value,
      };

      this.formService.saveFormData(formData).subscribe({
        next: () => {
          this.isSubmitting = false;
          stepper.next();
        },
        error: (error) => {
          console.error('Error saving form data:', error);
          this.isSubmitting = false;
        },
      });
    } else {
      this.markAllFieldsAsTouched(formGroup);
    }
  }

  onSubmitProfessional(stepper: MatStepper): void {
    this.onSubmit(stepper, this.professionalInfoForm);
  }

  onSubmitAdditional(stepper: MatStepper): void {
    this.onSubmit(stepper, this.additionalInfoForm);
  }

  onSubmitEnergyScenario(stepper: MatStepper): void {
    this.onSubmit(stepper, this.energyScenarioForm);
  }

  onSubmitAnswerQuestion(stepper: MatStepper): void {
    this.onSubmit(stepper, this.answerQuestionForm);
  }

  onFinalSubmit(): void {
    this.isSubmitting = true;
    const formData: UserFormData = {
      ...this.personalInfoForm.value,
      ...this.professionalInfoForm.value,
      ...this.additionalInfoForm.value,
      ...this.energyScenarioForm.value,
      ...this.answerQuestionForm.value,
    };

    this.formService.saveFormData(formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        // Here you can add navigation to a success page or show a success message
        console.log('Form submitted successfully!', formData);
        // Optionally: this.router.navigate(['/success']);
      },
      error: (error) => {
        console.error('Error submitting form:', error);
        this.isSubmitting = false;
        // Here you can show an error message to the user
      },
    });
  }

  private markAllFieldsAsTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  onReset(): void {
    this.personalInfoForm.reset();
    this.professionalInfoForm.reset();
    this.additionalInfoForm.reset();
    this.energyScenarioForm.reset();
    this.answerQuestionForm.reset();
    this.formService.clearFormData();
  }

  selectLanguageLevel(level: string, fieldName: string): void {
    this.professionalInfoForm.get(fieldName)?.setValue(level);
  }

  isLanguageLevelSelected(level: string, fieldName: string): boolean {
    return this.professionalInfoForm.get(fieldName)?.value === level;
  }

  toggleCountryDropdown(): void {
    this.showCountryDropdown = !this.showCountryDropdown;
  }

  selectPhoneCountry(country: Country): void {
    this.selectedPhoneCountry = country;
    this.personalInfoForm.patchValue({ phoneCountryCode: country.code });
    this.showCountryDropdown = false;
  }

  onDatepickerClosed(input: HTMLInputElement): void {
    input.blur();
  }
}
