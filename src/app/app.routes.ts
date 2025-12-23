import { Routes } from '@angular/router';
import { WelcomeFormComponent } from './features/form/components/welcome-form/welcome-form.component';

export const routes: Routes = [
  {
    path: '',
    component: WelcomeFormComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];

