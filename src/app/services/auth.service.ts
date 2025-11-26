import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { RegisterRequest, RegisterResponse } from '../models/register.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private apiService: ApiService) {}

  /**
   * Realiza el login del usuario
   * @param loginData Datos de login (usuario y password)
   * @returns Observable con la respuesta del servidor
   */
  login(loginData: LoginRequest): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('/auth/login', loginData);
  }

  /**
   * Registra un nuevo usuario
   * @param registerData Datos de registro
   * @returns Observable con la respuesta del servidor
   */
  register(registerData: RegisterRequest): Observable<RegisterResponse> {
    return this.apiService.post<RegisterResponse>('/usuarios', registerData);
  }

  /**
   * Obtiene el usuario actual desde localStorage
   * @returns Usuario actual o null
   */
  getCurrentUser(): any {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return null;
    }
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Verifica si el usuario actual es administrador
   * @returns true si es admin, false en caso contrario
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.tipoUsuario === 'ADMIN';
  }

  /**
   * Verifica si el usuario actual es concesionaria
   * @returns true si es concesionaria, false en caso contrario
   */
  isConcesionaria(): boolean {
    const user = this.getCurrentUser();
    return user?.tipoUsuario === 'CONCESIONARIA';
  }
}

