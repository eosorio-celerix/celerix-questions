import { Routes } from '@angular/router';
import { WelcomeFormComponent } from './features/form/components/welcome-form/welcome-form.component';

export const routes: Routes = [
  {
    path: '',
    component: WelcomeFormComponent,
  },
  {
    path: 'informes/:token',
    loadComponent: () =>
      import('./features/reports-portal/reports-portal.component').then(
        (m) => m.ReportsPortalComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];

