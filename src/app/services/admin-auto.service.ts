import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { Auto, FiltrosBusqueda, BusquedaResponse } from '../models/auto.model';
import { AutoBase, AutoBaseCreate } from '../models/auto-base.model';

@Injectable({
  providedIn: 'root'
})
export class AdminAutoService {
  constructor(private apiService: ApiService) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Consulta todos los autos guardados como favoritos
   */
  consultarAutosFavoritos(filtros?: FiltrosBusqueda): Observable<BusquedaResponse> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.palabraClave) {
        params = params.set('palabraClave', filtros.palabraClave);
      }
      if (filtros.marca) {
        params = params.set('marca', filtros.marca);
      }
      if (filtros.modelo) {
        params = params.set('modelo', filtros.modelo);
      }
      if (filtros.page !== undefined) {
        params = params.set('page', filtros.page.toString());
      }
      if (filtros.size !== undefined) {
        params = params.set('size', filtros.size.toString());
      }
      if (filtros.sortBy) {
        params = params.set('sortBy', filtros.sortBy);
      }
      if (filtros.sortOrder) {
        params = params.set('sortOrder', filtros.sortOrder);
      }
    }

    return this.apiService.get<BusquedaResponse>('/admin/autos/favoritos', {
      headers: this.getHeaders(),
      params
    });
  }

  /**
   * Consulta todos los autos comprados
   */
  consultarAutosComprados(filtros?: FiltrosBusqueda): Observable<BusquedaResponse> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.palabraClave) {
        params = params.set('palabraClave', filtros.palabraClave);
      }
      if (filtros.marca) {
        params = params.set('marca', filtros.marca);
      }
      if (filtros.modelo) {
        params = params.set('modelo', filtros.modelo);
      }
      if (filtros.concesionariaId !== undefined) {
        params = params.set('concesionariaId', filtros.concesionariaId.toString());
      }
      if (filtros.page !== undefined) {
        params = params.set('page', filtros.page.toString());
      }
      if (filtros.size !== undefined) {
        params = params.set('size', filtros.size.toString());
      }
      if (filtros.sortBy) {
        params = params.set('sortBy', filtros.sortBy);
      }
      if (filtros.sortOrder) {
        params = params.set('sortOrder', filtros.sortOrder);
      }
    }

    return this.apiService.get<BusquedaResponse>('/admin/autos/comprados', {
      headers: this.getHeaders(),
      params
    });
  }

  /**
   * Obtiene el detalle de un auto favorito
   */
  obtenerDetalleAutoFavorito(autoId: number): Observable<Auto> {
    return this.apiService.get<Auto>(`/admin/autos/favoritos/${autoId}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Obtiene el detalle de un auto comprado
   */
  obtenerDetalleAutoComprado(autoId: number): Observable<Auto> {
    return this.apiService.get<Auto>(`/admin/autos/comprados/${autoId}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Exporta el listado de autos favoritos
   */
  exportarAutosFavoritos(formato: 'excel' | 'pdf', filtros?: FiltrosBusqueda): Observable<Blob> {
    let params = new HttpParams().set('formato', formato);
    
    if (filtros) {
      if (filtros.palabraClave) {
        params = params.set('palabraClave', filtros.palabraClave);
      }
      if (filtros.marca) {
        params = params.set('marca', filtros.marca);
      }
    }

    return this.apiService.get<Blob>('/admin/autos/favoritos/exportar', {
      headers: this.getHeaders(),
      params,
      responseType: 'blob'
    });
  }

  /**
   * Exporta el listado de autos comprados
   */
  exportarAutosComprados(formato: 'excel' | 'pdf', filtros?: FiltrosBusqueda): Observable<Blob> {
    let params = new HttpParams().set('formato', formato);
    
    if (filtros) {
      if (filtros.palabraClave) {
        params = params.set('palabraClave', filtros.palabraClave);
      }
      if (filtros.marca) {
        params = params.set('marca', filtros.marca);
      }
      if (filtros.concesionariaId !== undefined) {
        params = params.set('concesionariaId', filtros.concesionariaId.toString());
      }
    }

    return this.apiService.get<Blob>('/admin/autos/comprados/exportar', {
      headers: this.getHeaders(),
      params,
      responseType: 'blob'
    });
  }

  /**
   * ============================================
   * MÉTODOS PARA GESTIÓN DE AUTOS BASE
   * ============================================
   */

  /**
   * Crea un nuevo auto base (marca, modelo, año)
   * Solo ADMIN puede crear autos
   */
  crearAutoBase(auto: AutoBaseCreate): Observable<AutoBase> {
    return this.apiService.post<AutoBase>('/autos', auto, {
      headers: this.getHeaders()
    });
  }

  /**
   * Lista todos los autos base
   * Disponible para ADMIN o CONCESIONARIA
   */
  listarAutosBase(): Observable<AutoBase[]> {
    return this.apiService.get<AutoBase[]>('/autos', {
      headers: this.getHeaders()
    });
  }

  /**
   * Elimina un auto base por su ID
   * Solo ADMIN puede eliminar autos
   */
  eliminarAutoBase(id: number): Observable<void> {
    return this.apiService.delete<void>(`/autos/${id}`, {
      headers: this.getHeaders()
    });
  }
}

