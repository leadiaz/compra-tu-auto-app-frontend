import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { compradorGuard } from './guards/comprador.guard';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadComponent: () => import('./components/dashboard/dashboard-home.component').then(m => m.DashboardHomeComponent)
      },
      // Rutas del comprador
      {
        path: 'ofertas',
        loadComponent: () => import('./components/comprador/buscar-autos/buscar-autos.component').then(m => m.BuscarAutosComponent),
        canActivate: [compradorGuard]
      },
      {
        path: 'autos/:id',
        loadComponent: () => import('./components/comprador/detalle-auto/detalle-auto.component').then(m => m.DetalleAutoComponent),
        canActivate: [compradorGuard]
      },
      {
        path: 'favoritos',
        loadComponent: () => import('./components/comprador/favoritos/favoritos.component').then(m => m.FavoritosComponent),
        canActivate: [compradorGuard]
      },
      {
        path: 'mis-compras',
        loadComponent: () => import('./components/comprador/mis-compras/mis-compras.component').then(m => m.MisComprasComponent),
        canActivate: [compradorGuard]
      },
      {
        path: 'compras/:id',
        loadComponent: () => import('./components/comprador/mis-compras/mis-compras.component').then(m => m.MisComprasComponent),
        canActivate: [compradorGuard]
      },
      {
        path: 'perfil',
        loadComponent: () => import('./components/comprador/perfil/perfil.component').then(m => m.PerfilComponent),
        canActivate: [compradorGuard]
      }
    ]
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'registro',
    loadComponent: () => import('./components/registro/registro.component').then(m => m.RegistroComponent)
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
