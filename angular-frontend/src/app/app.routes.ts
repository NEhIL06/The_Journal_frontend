import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing').then((m) => m.Landing),
    title: 'JournalApp · Your thoughts, beautifully kept',
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
    title: 'Sign in · JournalApp',
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
    title: 'Create account · JournalApp',
  },
  { path: 'signup', redirectTo: 'register', pathMatch: 'full' },
  {
    path: 'journal',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/journal/dashboard/dashboard').then((m) => m.Dashboard),
        title: 'My journal · JournalApp',
      },
      {
        path: 'new',
        loadComponent: () => import('./features/journal/editor/editor').then((m) => m.JournalEditor),
        data: { mode: 'create' },
        title: 'New entry · JournalApp',
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./features/journal/editor/editor').then((m) => m.JournalEditor),
        data: { mode: 'edit' },
        title: 'Edit entry · JournalApp',
      },
      {
        path: ':id',
        loadComponent: () => import('./features/journal/detail/detail').then((m) => m.JournalDetail),
        title: 'Journal entry · JournalApp',
      },
    ],
  },
  { path: 'dashboard', redirectTo: 'journal', pathMatch: 'full' },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
    title: 'Page not found · JournalApp',
  },
];
