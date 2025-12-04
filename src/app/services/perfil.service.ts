import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { ApiService } from './api.service';
import { Perfil, PerfilUpdate, CambioPassword } from '../models/perfil.model';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  constructor(private apiService: ApiService) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Obtiene el perfil del usuario actual
   */
  obtenerPerfil(): Observable<Perfil> {
    return this.apiService.get<Perfil>('/usuarios/mi-perfil', {
      headers: this.getHeaders()
    });
  }

  /**
   * Actualiza el perfil del usuario
   */
  actualizarPerfil(update: PerfilUpdate): Observable<Perfil> {
    return this.apiService.put<Perfil>('/usuarios/mi-perfil', update, {
      headers: this.getHeaders()
    });
  }

  /**
   * Cambia la contraseña del usuario
   */
  cambiarPassword(cambioPassword: CambioPassword): Observable<void> {
    return this.apiService.put<void>('/usuarios/cambiar-password', cambioPassword, {
      headers: this.getHeaders()
    });
  }
}

