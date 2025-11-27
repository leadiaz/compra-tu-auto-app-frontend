import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { UsuarioAdmin, UsuarioAdminCreate, UsuarioAdminUpdate, UsuarioAdminFiltros, UsuarioAdminResponse } from '../models/usuario-admin.model';

@Injectable({
  providedIn: 'root'
})
export class AdminUsuarioService {
  constructor(private apiService: ApiService) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Lista todos los usuarios del sistema con filtros opcionales
   * Retorna un array directo sin paginación (según documentación del endpoint)
   */
  listarUsuarios(filtros?: { tipoUsuario?: string; sinConcesionaria?: boolean }): Observable<UsuarioAdmin[]> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.tipoUsuario) {
        params = params.set('tipoUsuario', filtros.tipoUsuario);
      }
      if (filtros.sinConcesionaria !== undefined) {
        params = params.set('sinConcesionaria', filtros.sinConcesionaria.toString());
      }
    }

    return this.apiService.get<UsuarioAdmin[]>('/usuarios', {
      headers: this.getHeaders(),
      params
    });
  }

  /**
   * Obtiene el detalle de un usuario
   */
  obtenerDetalleUsuario(id: number): Observable<UsuarioAdmin> {
    return this.apiService.get<UsuarioAdmin>(`/admin/usuarios/${id}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Crea un nuevo usuario
   */
  crearUsuario(usuario: UsuarioAdminCreate): Observable<UsuarioAdmin> {
    return this.apiService.post<UsuarioAdmin>('/admin/usuarios', usuario, {
      headers: this.getHeaders()
    });
  }

  /**
   * Actualiza un usuario existente
   */
  actualizarUsuario(id: number, usuario: UsuarioAdminUpdate): Observable<UsuarioAdmin> {
    return this.apiService.put<UsuarioAdmin>(`/admin/usuarios/${id}`, usuario, {
      headers: this.getHeaders()
    });
  }

  /**
   * Elimina un usuario
   */
  eliminarUsuario(id: number): Observable<void> {
    return this.apiService.delete<void>(`/admin/usuarios/${id}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Activa un usuario
   */
  activarUsuario(id: number): Observable<UsuarioAdmin> {
    return this.apiService.patch<UsuarioAdmin>(`/admin/usuarios/${id}/activar`, {}, {
      headers: this.getHeaders()
    });
  }

  /**
   * Desactiva un usuario
   */
  desactivarUsuario(id: number): Observable<UsuarioAdmin> {
    return this.apiService.patch<UsuarioAdmin>(`/admin/usuarios/${id}/desactivar`, {}, {
      headers: this.getHeaders()
    });
  }

  /**
   * Exporta el listado de usuarios
   */
  exportarUsuarios(formato: 'excel' | 'pdf', filtros?: UsuarioAdminFiltros): Observable<Blob> {
    let params = new HttpParams().set('formato', formato);
    
    if (filtros) {
      if (filtros.tipoUsuario) {
        params = params.set('tipoUsuario', filtros.tipoUsuario);
      }
      if (filtros.activo !== undefined) {
        params = params.set('activo', filtros.activo.toString());
      }
      if (filtros.palabraClave) {
        params = params.set('palabraClave', filtros.palabraClave);
      }
    }

    return this.apiService.get<Blob>('/admin/usuarios/exportar', {
      headers: this.getHeaders(),
      params,
      responseType: 'blob'
    });
  }
}

