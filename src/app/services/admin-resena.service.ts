import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { Resena, TopAutoRankeado } from '../models/resena.model';

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
   * Lista todas las reseñas del sistema (ADMIN)
   * GET /resenas/admin
   */
  listarTodasResenas(): Observable<Resena[]> {
    return this.apiService.get<Resena[]>('/resenas/admin', {
      headers: this.getHeaders()
    });
  }

  /**
   * Obtiene el Top 5 de autos mejor rankeados (ADMIN)
   * GET /resenas/admin/top-autos-rankeados
   */
  obtenerTopAutosRankeados(): Observable<TopAutoRankeado[]> {
    return this.apiService.get<TopAutoRankeado[]>('/resenas/admin/top-autos-rankeados', {
      headers: this.getHeaders()
    });
  }

  /**
   * Consulta todos los puntajes y observaciones (método legacy, mantiene compatibilidad)
   * Ahora usa /resenas/admin
   */
  consultarPuntajes(filtros?: ResenaAdminFiltros): Observable<Resena[]> {
    // El endpoint ahora devuelve un array directo, no paginado
    // Aplicamos filtros del lado del cliente si es necesario
    return this.listarTodasResenas();
  }

  /**
   * Obtiene el detalle de una reseña específica
   * Busca en la lista de todas las reseñas
   */
  obtenerDetallePuntaje(resenaId: number): Observable<Resena> {
    return new Observable(observer => {
      this.listarTodasResenas().subscribe({
        next: (resenas) => {
          const resena = resenas.find(r => r.id === resenaId);
          if (resena) {
            observer.next(resena);
            observer.complete();
          } else {
            observer.error(new Error('Reseña no encontrada'));
          }
        },
        error: (error) => observer.error(error)
      });
    });
  }

  /**
   * Elimina una reseña (ADMIN)
   * DELETE /resenas/{autoId} - Nota: El endpoint usa autoId, no resenaId
   * Para el admin, necesitaríamos un endpoint específico o usar el mismo
   */
  eliminarPuntaje(autoId: number): Observable<void> {
    // Nota: Según la documentación, DELETE /resenas/{autoId} requiere ser el autor
    // Para admin, podría necesitarse un endpoint específico como DELETE /resenas/admin/{id}
    // Por ahora usamos el endpoint estándar
    return this.apiService.delete<void>(`/resenas/${autoId}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Exporta el listado de puntajes y observaciones
   * Nota: Este endpoint no está en la documentación, se mantiene por compatibilidad
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

