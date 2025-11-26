import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { compradorGuard } from './guards/comprador.guard';
import { concesionariaGuard } from './guards/concesionaria.guard';

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
      },
      // Rutas de concesionaria
      {
        path: 'mis-autos',
        loadComponent: () => import('./components/concesionaria/mis-autos/mis-autos.component').then(m => m.MisAutosComponent),
        canActivate: [concesionariaGuard]
      },
      {
        path: 'publicar-auto',
        loadComponent: () => import('./components/concesionaria/publicar-auto/publicar-auto.component').then(m => m.PublicarAutoComponent),
        canActivate: [concesionariaGuard]
      },
      {
        path: 'editar-auto/:id',
        loadComponent: () => import('./components/concesionaria/editar-auto/editar-auto.component').then(m => m.EditarAutoComponent),
        canActivate: [concesionariaGuard]
      },
      {
        path: 'ventas',
        loadComponent: () => import('./components/concesionaria/ventas/ventas.component').then(m => m.VentasComponent),
        canActivate: [concesionariaGuard]
      },
      {
        path: 'estadisticas',
        loadComponent: () => import('./components/concesionaria/estadisticas/estadisticas.component').then(m => m.EstadisticasComponent),
        canActivate: [concesionariaGuard]
      },
      {
        path: 'perfil-concesionaria',
        loadComponent: () => import('./components/concesionaria/perfil/perfil.component').then(m => m.PerfilConcesionariaComponent),
        canActivate: [concesionariaGuard]
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
