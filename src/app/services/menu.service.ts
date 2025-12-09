import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { MenuItem, MenuResponse } from '../models/menu.model';
import { TipoUsuario } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  // Menús estáticos simulados según tipo de usuario
  private readonly menusEstaticos: Record<TipoUsuario, MenuItem[]> = {
    [TipoUsuario.ADMIN]: [
      {
        id: 1,
        label: 'Dashboard',
        icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
        route: '/dashboard/home',
        orden: 1
      },
      {
        id: 2,
        label: 'Usuarios',
        icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
        route: '/dashboard/usuarios',
        orden: 2
      },
      {
        id: 3,
        label: 'Concesionarias',
        icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
        route: '/dashboard/concesionarias',
        orden: 3
      },
      {
        id: 9,
        label: 'Gestión de Autos',
        icon: 'M12 4v16m8-8H4',
        route: '/dashboard/gestion-autos',
        orden: 4.5
      },
      {
        id: 5,
        label: 'Puntajes',
        icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
        route: '/dashboard/puntajes',
        orden: 5
      },
      {
        id: 6,
        label: 'Compras',
        icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
        route: '/dashboard/compras-admin',
        orden: 6
      },
      {
        id: 7,
        label: 'Reportes',
        icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        route: '/dashboard/reportes',
        orden: 7
      },
      {
        id: 8,
        label: 'Perfil',
        icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
        route: '/dashboard/perfil-admin',
        orden: 8
      }
    ],
    [TipoUsuario.COMPRADOR]: [
      {
        id: 1,
        label: 'Dashboard',
        icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
        route: '/dashboard/home',
        orden: 1
      },
      {
        id: 2,
        label: 'Buscar Autos',
        icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
        route: '/dashboard/ofertas',
        orden: 2
      },
      {
        id: 3,
        label: 'Mis Favoritos',
        icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
        route: '/dashboard/favoritos',
        orden: 3
      },
      {
        id: 4,
        label: 'Mis Reseñas',
        icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
        route: '/dashboard/mis-resenas',
        orden: 4
      },
      {
        id: 5,
        label: 'Mis Compras',
        icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
        route: '/dashboard/mis-compras',
        orden: 5
      },
      {
        id: 6,
        label: 'Perfil',
        icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
        route: '/dashboard/perfil',
        orden: 6
      }
    ],
    [TipoUsuario.CONCESIONARIO]: [
      {
        id: 1,
        label: 'Dashboard',
        icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
        route: '/dashboard/home',
        orden: 1
      },
      {
        id: 2,
        label: 'Mis Autos',
        icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
        route: '/dashboard/mis-autos',
        orden: 2
      },
      {
        id: 3,
        label: 'Mis Ofertas',
        icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        route: '/dashboard/mis-ofertas',
        orden: 3
      },
      {
        id: 4,
        label: 'Crear Oferta',
        icon: 'M12 4v16m8-8H4',
        route: '/dashboard/publicar-auto',
        orden: 4
      },
      {
        id: 5,
        label: 'Ventas',
        icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
        route: '/dashboard/ventas',
        orden: 5
      },
      {
        id: 6,
        label: 'Estadísticas',
        icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
        route: '/dashboard/estadisticas',
        orden: 6
      },
      {
        id: 6,
        label: 'Perfil',
        icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
        route: '/dashboard/perfil-concesionaria',
        orden: 6
      }
    ]
  };

  constructor() {}

  /**
   * Obtiene el menú del usuario según su tipo
   * Por ahora simula una petición HTTP con datos estáticos
   * @param tipoUsuario Tipo de usuario (ADMIN, COMPRADOR, CONCESIONARIO)
   * @returns Observable con el menú del usuario
   */
  getMenuByUserType(tipoUsuario: TipoUsuario): Observable<MenuResponse> {
    // Simular petición HTTP con delay
    const menu = this.menusEstaticos[tipoUsuario] || [];
    
    return of({
      items: menu.sort((a, b) => a.orden - b.orden)
    }).pipe(
      delay(300) // Simular latencia de red
    );
  }

  /**
   * Obtiene el menú del usuario autenticado
   * MOCK: Devuelve el menú mockeado basado en el tipo de usuario
   * @returns Observable con el menú del usuario
   */
  getMenu(): Observable<MenuResponse> {
    const token = localStorage.getItem('token');
    
    // Si no hay token, usar menú por defecto
    if (!token) {
      return this.getMenuByUserType(TipoUsuario.COMPRADOR);
    }

    // MOCK: Obtener el tipo de usuario desde localStorage y devolver el menú correspondiente
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const tipoUsuario = user.tipoUsuario as TipoUsuario;
        
        // Validar que el tipo de usuario sea válido
        if (tipoUsuario && Object.values(TipoUsuario).includes(tipoUsuario)) {
          console.log(`[MOCK] Devolviendo menú para usuario tipo: ${tipoUsuario}`);
          return this.getMenuByUserType(tipoUsuario);
        }
      } catch (error) {
        console.error('Error al parsear usuario desde localStorage:', error);
      }
    }
    return this.getMenuByUserType(TipoUsuario.COMPRADOR);
  }
}

