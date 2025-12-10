import { inject, PLATFORM_ID } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  
  // Verificar si estamos en el navegador antes de acceder a localStorage
  if (!isPlatformBrowser(platformId)) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
  
  const token = localStorage.getItem('token');
  const user = authService.getCurrentUser();
  
  if (token && user) {
    return true;
  }
  
  // Redirigir al login si no está autenticado
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

