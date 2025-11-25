import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TipoUsuario } from '../models/auth.model';

export const compradorGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const user = authService.getCurrentUser();
  const token = localStorage.getItem('token');
  
  if (!token || !user) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
  
  // Verificar que el usuario sea COMPRADOR
  if (user.tipoUsuario === TipoUsuario.COMPRADOR) {
    return true;
  }
  
  // Si no es comprador, redirigir al dashboard según su rol
  router.navigate(['/dashboard']);
  return false;
};

