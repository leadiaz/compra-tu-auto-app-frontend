import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Rutas con parámetros dinámicos deben usar renderizado en servidor
  {
    path: 'dashboard/autos/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'dashboard/compras/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'dashboard/editar-auto/:id',
    renderMode: RenderMode.Server
  },
  // Todas las demás rutas pueden usar prerendering
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
