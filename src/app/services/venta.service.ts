import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { Venta, VentaFiltros, VentaResponse, EstadisticasVentas } from '../models/venta.model';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  constructor(private apiService: ApiService) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Lista todas las ventas de la concesionaria
   */
  listarVentas(filtros?: VentaFiltros): Observable<VentaResponse> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.fechaDesde) {
        params = params.set('fechaDesde', filtros.fechaDesde);
      }
      if (filtros.fechaHasta) {
        params = params.set('fechaHasta', filtros.fechaHasta);
      }
      if (filtros.compradorId !== undefined) {
        params = params.set('compradorId', filtros.compradorId.toString());
      }
      if (filtros.autoId !== undefined) {
        params = params.set('autoId', filtros.autoId.toString());
      }
      if (filtros.precioMin !== undefined) {
        params = params.set('precioMin', filtros.precioMin.toString());
      }
      if (filtros.precioMax !== undefined) {
        params = params.set('precioMax', filtros.precioMax.toString());
      }
      if (filtros.estado) {
        params = params.set('estado', filtros.estado);
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

    return this.apiService.get<VentaResponse>('/concesionarias/ventas', {
      headers: this.getHeaders(),
      params
    });
  }

  /**
   * Obtiene el detalle de una venta específica
   */
  obtenerDetalleVenta(ventaId: number): Observable<Venta> {
    return this.apiService.get<Venta>(`/concesionarias/ventas/${ventaId}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Obtiene estadísticas de ventas
   */
  obtenerEstadisticas(filtros?: VentaFiltros): Observable<EstadisticasVentas> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.fechaDesde) {
        params = params.set('fechaDesde', filtros.fechaDesde);
      }
      if (filtros.fechaHasta) {
        params = params.set('fechaHasta', filtros.fechaHasta);
      }
    }

    return this.apiService.get<EstadisticasVentas>('/concesionarias/ventas/estadisticas', {
      headers: this.getHeaders(),
      params
    });
  }

  /**
   * Exporta las ventas en formato Excel o PDF
   */
  exportarVentas(formato: 'excel' | 'pdf', filtros?: VentaFiltros): Observable<Blob> {
    let params = new HttpParams().set('formato', formato);
    
    if (filtros) {
      if (filtros.fechaDesde) {
        params = params.set('fechaDesde', filtros.fechaDesde);
      }
      if (filtros.fechaHasta) {
        params = params.set('fechaHasta', filtros.fechaHasta);
      }
      if (filtros.compradorId !== undefined) {
        params = params.set('compradorId', filtros.compradorId.toString());
      }
      if (filtros.autoId !== undefined) {
        params = params.set('autoId', filtros.autoId.toString());
      }
    }

    return this.apiService.get<Blob>('/concesionarias/ventas/exportar', {
      headers: this.getHeaders(),
      params,
      responseType: 'blob'
    });
  }
}



