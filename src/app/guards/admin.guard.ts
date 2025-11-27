import { inject, PLATFORM_ID } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { TipoUsuario } from '../models/auth.model';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  
  // Verificar si estamos en el navegador antes de acceder a localStorage
  if (!isPlatformBrowser(platformId)) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
  
  const user = authService.getCurrentUser();
  const token = localStorage.getItem('token');
  
  if (!token || !user) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
  
  // Verificar que el usuario sea ADMIN
  if (user.tipoUsuario === TipoUsuario.ADMIN) {
    return true;
  }
  
  // Si no es admin, redirigir al dashboard según su rol
  router.navigate(['/dashboard']);
  return false;
};

