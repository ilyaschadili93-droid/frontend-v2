import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout';

export const routes: Routes = [
  // ---- Full-screen auth pages (no navbar/footer) ----
  {
    path: 'login',
    title: 'Sign in — Formateur AI',
    data: { mode: 'login' },
    loadComponent: () => import('./features/auth/auth-page/auth-page').then((m) => m.AuthPageComponent),
  },
  {
    path: 'register',
    title: 'Create account — Formateur AI',
    data: { mode: 'register' },
    loadComponent: () => import('./features/auth/auth-page/auth-page').then((m) => m.AuthPageComponent),
  },

  // ---- Main app (inside the navbar + footer layout) ----
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      {
        path: 'home',
        title: 'Formateur AI — Home',
        loadComponent: () => import('./features/home/home').then((m) => m.HomeComponent),
      },
      {
        path: 'categories',
        title: 'Categories — Formateur AI',
        loadComponent: () => import('./features/categories/categories-list/categories-list').then((m) => m.CategoriesListComponent),
      },
      {
        path: 'categories/:id',
        title: 'Category — Formateur AI',
        loadComponent: () => import('./features/categories/category-detail/category-detail').then((m) => m.CategoryDetailComponent),
      },
      {
        path: 'formations',
        title: 'Formations — Formateur AI',
        loadComponent: () => import('./features/formations/formations-list/formations-list').then((m) => m.FormationsListComponent),
      },
      {
        path: 'formations/:id',
        title: 'Formation — Formateur AI',
        loadComponent: () => import('./features/formations/formation-detail/formation-detail').then((m) => m.FormationDetailComponent),
      },
      {
        path: 'sessions',
        title: 'Sessions — Formateur AI',
        canActivate: [authGuard],
        loadComponent: () => import('./features/sessions/sessions-list/sessions-list').then((m) => m.SessionsListComponent),
      },
      {
        path: 'sessions/:id',
        title: 'Session — Formateur AI',
        canActivate: [authGuard],
        loadComponent: () => import('./features/sessions/session-detail/session-detail').then((m) => m.SessionDetailComponent),
      },
      {
        path: 'trainers',
        title: 'AI Trainers — Formateur AI',
        loadComponent: () => import('./features/trainers/trainers-list/trainers-list').then((m) => m.TrainersListComponent),
      },
      {
        path: 'trainers/:id',
        title: 'AI Trainer — Formateur AI',
        loadComponent: () => import('./features/trainers/trainer-detail/trainer-detail').then((m) => m.TrainerDetailComponent),
      },
      {
        path: 'my-courses',
        title: 'My Courses — Formateur AI',
        canActivate: [authGuard],
        loadComponent: () => import('./features/my-courses/my-courses').then((m) => m.MyCoursesComponent),
      },
      {
        path: 'admin',
        title: 'Admin — Formateur AI',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/admin/admin').then((m) => m.AdminComponent),
      },
      {
        path: '**',
        title: 'Not found — Formateur AI',
        loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFoundComponent),
      },
    ],
  },
];
