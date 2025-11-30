import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/form/components/welcome-form/welcome-form.component').then(m => m.WelcomeFormComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];

