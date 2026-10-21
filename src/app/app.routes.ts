import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path:"",
        loadComponent: ()  =>
             import('./pages/home/home').then(m => m.Home)
    },
    {
        path:"login",
        loadComponent: ()  =>
             import('./pages/login/login').then(m => m.Login)
    },
    {
        path:"register",
        loadComponent: ()  =>
             import('./pages/register/register').then(m => m.Register)
    },
    {
        path: 'confirm-email',
        loadComponent: () =>
            import('./pages/confirm-email/confirm-email')
            .then(m => m.ConfirmEmail)
    },
    {
        path: 'check-email',
        loadComponent: () =>
            import('./pages/check-email/check-email')
            .then(m => m.CheckEmail)
    }
];