import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { Resena } from '../models/resena.model';

export interface ResenaAdminFiltros {
  usuarioId?: number;
  autoId?: number;
  puntajeMin?: number;
  puntajeMax?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  palabraClave?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface ResenaAdminResponse {
  content: Resena[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminResenaService {
  constructor(private apiService: ApiService) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Consulta todos los puntajes y observaciones
   */
  consultarPuntajes(filtros?: ResenaAdminFiltros): Observable<ResenaAdminResponse> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.usuarioId !== undefined) {
        params = params.set('usuarioId', filtros.usuarioId.toString());
      }
      if (filtros.autoId !== undefined) {
        params = params.set('autoId', filtros.autoId.toString());
      }
      if (filtros.puntajeMin !== undefined) {
        params = params.set('puntajeMin', filtros.puntajeMin.toString());
      }
      if (filtros.puntajeMax !== undefined) {
        params = params.set('puntajeMax', filtros.puntajeMax.toString());
      }
      if (filtros.fechaDesde) {
        params = params.set('fechaDesde', filtros.fechaDesde);
      }
      if (filtros.fechaHasta) {
        params = params.set('fechaHasta', filtros.fechaHasta);
      }
      if (filtros.palabraClave) {
        params = params.set('palabraClave', filtros.palabraClave);
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

    return this.apiService.get<ResenaAdminResponse>('/admin/puntajes', {
      headers: this.getHeaders(),
      params
    });
  }

  /**
   * Obtiene el detalle de una reseña específica
   */
  obtenerDetallePuntaje(resenaId: number): Observable<Resena> {
    return this.apiService.get<Resena>(`/admin/puntajes/${resenaId}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Elimina una reseña
   */
  eliminarPuntaje(resenaId: number): Observable<void> {
    return this.apiService.delete<void>(`/admin/puntajes/${resenaId}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Exporta el listado de puntajes y observaciones
   */
  exportarPuntajes(formato: 'excel' | 'pdf', filtros?: ResenaAdminFiltros): Observable<Blob> {
    let params = new HttpParams().set('formato', formato);
    
    if (filtros) {
      if (filtros.usuarioId !== undefined) {
        params = params.set('usuarioId', filtros.usuarioId.toString());
      }
      if (filtros.autoId !== undefined) {
        params = params.set('autoId', filtros.autoId.toString());
      }
      if (filtros.puntajeMin !== undefined) {
        params = params.set('puntajeMin', filtros.puntajeMin.toString());
      }
      if (filtros.puntajeMax !== undefined) {
        params = params.set('puntajeMax', filtros.puntajeMax.toString());
      }
    }

    return this.apiService.get<Blob>('/admin/puntajes/exportar', {
      headers: this.getHeaders(),
      params,
      responseType: 'blob'
    });
  }
}

