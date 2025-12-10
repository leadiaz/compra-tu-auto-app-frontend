import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { Auto, FiltrosBusqueda, BusquedaResponse } from '../models/auto.model';

@Injectable({
  providedIn: 'root'
})
export class ConcesionariaAutoService {
  constructor(private apiService: ApiService) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Lista todos los autos de la concesionaria
   */
  listarMisAutos(page: number = 0, size: number = 10, filtros?: FiltrosBusqueda): Observable<BusquedaResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (filtros) {
      if (filtros.marca) {
        params = params.set('marca', filtros.marca);
      }
      if (filtros.modelo) {
        params = params.set('modelo', filtros.modelo);
      }
      if (filtros.precioMin !== undefined) {
        params = params.set('precioMin', filtros.precioMin.toString());
      }
      if (filtros.precioMax !== undefined) {
        params = params.set('precioMax', filtros.precioMax.toString());
      }
      if ('activo' in filtros && filtros.activo !== undefined) {
        params = params.set('activo', filtros.activo.toString());
      }
      if (filtros.sortBy) {
        params = params.set('sortBy', filtros.sortBy);
      }
      if (filtros.sortOrder) {
        params = params.set('sortOrder', filtros.sortOrder);
      }
    }

    return this.apiService.get<BusquedaResponse>('/concesionarias/mis-autos', {
      headers: this.getHeaders(),
      params
    });
  }

  /**
   * Obtiene el detalle de un auto de la concesionaria
   */
  obtenerDetalleAuto(id: number): Observable<Auto> {
    return this.apiService.get<Auto>(`/concesionarias/autos/${id}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Crea un nuevo auto
   */
  crearAuto(auto: Partial<Auto>): Observable<Auto> {
    return this.apiService.post<Auto>('/concesionarias/autos', auto, {
      headers: this.getHeaders()
    });
  }

  /**
   * Actualiza un auto existente
   */
  actualizarAuto(id: number, auto: Partial<Auto>): Observable<Auto> {
    return this.apiService.put<Auto>(`/concesionarias/autos/${id}`, auto, {
      headers: this.getHeaders()
    });
  }

  /**
   * Elimina un auto
   */
  eliminarAuto(id: number): Observable<void> {
    return this.apiService.delete<void>(`/concesionarias/autos/${id}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Actualiza solo el precio de un auto
   */
  actualizarPrecio(id: number, precio: number): Observable<Auto> {
    return this.apiService.patch<Auto>(`/concesionarias/autos/${id}/precio`, { precio }, {
      headers: this.getHeaders()
    });
  }

  /**
   * Activa un auto
   */
  activarAuto(id: number): Observable<Auto> {
    return this.apiService.patch<Auto>(`/concesionarias/autos/${id}/activar`, {}, {
      headers: this.getHeaders()
    });
  }

  /**
   * Desactiva un auto
   */
  desactivarAuto(id: number): Observable<Auto> {
    return this.apiService.patch<Auto>(`/concesionarias/autos/${id}/desactivar`, {}, {
      headers: this.getHeaders()
    });
  }

  /**
   * Sube una imagen para un auto
   */
  subirImagen(autoId: number, imagen: File): Observable<any> {
    const formData = new FormData();
    formData.append('imagen', imagen);
    
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
      // No establecer Content-Type, el navegador lo hará automáticamente con el boundary
    });

    return this.apiService.post<any>(`/concesionarias/autos/${autoId}/imagenes`, formData, {
      headers
    });
  }

  /**
   * Elimina una imagen de un auto
   */
  eliminarImagen(autoId: number, imagenId: number): Observable<void> {
    return this.apiService.delete<void>(`/concesionarias/autos/${autoId}/imagenes/${imagenId}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Duplica un auto existente
   */
  duplicarAuto(id: number): Observable<Auto> {
    return this.apiService.post<Auto>(`/concesionarias/autos/${id}/duplicar`, {}, {
      headers: this.getHeaders()
    });
  }

  /**
   * Exporta el listado de autos
   */
  exportarAutos(formato: 'excel' | 'pdf'): Observable<Blob> {
    const params = new HttpParams().set('formato', formato);
    
    return this.apiService.get<Blob>('/concesionarias/autos/exportar', {
      headers: this.getHeaders(),
      params,
      responseType: 'blob'
    });
  }
}

