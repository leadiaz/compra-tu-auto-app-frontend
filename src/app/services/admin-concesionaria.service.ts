import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { ConcesionariaAdmin, ConcesionariaAdminCreate, ConcesionariaAdminUpdate, ConcesionariaAdminFiltros, ConcesionariaAdminResponse } from '../models/concesionaria-admin.model';
import { UsuarioAdmin } from '../models/usuario-admin.model';

@Injectable({
  providedIn: 'root'
})
export class AdminConcesionariaService {
  constructor(private apiService: ApiService) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Lista todas las concesionarias del sistema
   * Retorna un array directo sin paginación (según documentación del endpoint)
   */
  listarConcesionarias(): Observable<ConcesionariaAdmin[]> {
    return this.apiService.get<ConcesionariaAdmin[]>('/concesionarias', {
      headers: this.getHeaders()
    });
  }

  /**
   * Obtiene el detalle de una concesionaria
   */
  obtenerDetalleConcesionaria(id: number): Observable<ConcesionariaAdmin> {
    return this.apiService.get<ConcesionariaAdmin>(`/admin/concesionarias/${id}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Crea una nueva concesionaria
   */
  crearConcesionaria(concesionaria: ConcesionariaAdminCreate): Observable<ConcesionariaAdmin> {
    return this.apiService.post<ConcesionariaAdmin>('/concesionarias', concesionaria, {
      headers: this.getHeaders()
    });
  }

  /**
   * Actualiza una concesionaria existente
   */
  actualizarConcesionaria(id: number, concesionaria: ConcesionariaAdminUpdate): Observable<ConcesionariaAdmin> {
    return this.apiService.put<ConcesionariaAdmin>(`/admin/concesionarias/${id}`, concesionaria, {
      headers: this.getHeaders()
    });
  }

  /**
   * Elimina una concesionaria
   */
  eliminarConcesionaria(id: number): Observable<void> {
    return this.apiService.delete<void>(`/admin/concesionarias/${id}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Activa una concesionaria
   */
  activarConcesionaria(id: number): Observable<ConcesionariaAdmin> {
    return this.apiService.patch<ConcesionariaAdmin>(`/admin/concesionarias/${id}/activar`, {}, {
      headers: this.getHeaders()
    });
  }

  /**
   * Desactiva una concesionaria
   */
  desactivarConcesionaria(id: number): Observable<ConcesionariaAdmin> {
    return this.apiService.patch<ConcesionariaAdmin>(`/admin/concesionarias/${id}/desactivar`, {}, {
      headers: this.getHeaders()
    });
  }

  /**
   * Obtiene los usuarios asociados a una concesionaria
   */
  obtenerUsuariosConcesionaria(concesionariaId: number): Observable<UsuarioAdmin[]> {
    return this.apiService.get<UsuarioAdmin[]>(`/admin/concesionarias/${concesionariaId}/usuarios`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Exporta el listado de concesionarias
   */
  exportarConcesionarias(formato: 'excel' | 'pdf', filtros?: ConcesionariaAdminFiltros): Observable<Blob> {
    let params = new HttpParams().set('formato', formato);
    
    if (filtros) {
      if (filtros.activa !== undefined) {
        params = params.set('activa', filtros.activa.toString());
      }
      if (filtros.palabraClave) {
        params = params.set('palabraClave', filtros.palabraClave);
      }
    }

    return this.apiService.get<Blob>('/admin/concesionarias/exportar', {
      headers: this.getHeaders(),
      params,
      responseType: 'blob'
    });
  }
}

