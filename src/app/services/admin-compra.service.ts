import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { Compra, CompraFiltros } from '../models/compra.model';

export interface CompraAdminFiltros extends CompraFiltros {
  compradorId?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CompraAdminResponse {
  content: Compra[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface PrecioHistorico {
  autoId: number;
  autoMarca: string;
  autoModelo: string;
  precio: number;
  fecha: string;
  tipo: 'PUBLICACION' | 'COMPRA';
}

@Injectable({
  providedIn: 'root'
})
export class AdminCompraService {
  constructor(private apiService: ApiService) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Consulta todas las compras realizadas en el sistema
   */
  consultarCompras(filtros?: CompraAdminFiltros): Observable<CompraAdminResponse> {
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
      if (filtros.concesionariaId !== undefined) {
        params = params.set('concesionariaId', filtros.concesionariaId.toString());
      }
      if (filtros.precioMin !== undefined) {
        params = params.set('precioMin', filtros.precioMin.toString());
      }
      if (filtros.precioMax !== undefined) {
        params = params.set('precioMax', filtros.precioMax.toString());
      }
      if (filtros.marca) {
        params = params.set('marca', filtros.marca);
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

    return this.apiService.get<CompraAdminResponse>('/admin/compras', {
      headers: this.getHeaders(),
      params
    });
  }

  /**
   * Obtiene el detalle de una compra específica
   */
  obtenerDetalleCompra(compraId: number): Observable<Compra> {
    return this.apiService.get<Compra>(`/admin/compras/${compraId}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Consulta los precios históricos de un auto
   */
  consultarPreciosHistoricos(autoId: number): Observable<PrecioHistorico[]> {
    return this.apiService.get<PrecioHistorico[]>(`/admin/compras/precios-historicos/${autoId}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Exporta el listado de compras
   */
  exportarCompras(formato: 'excel' | 'pdf', filtros?: CompraAdminFiltros): Observable<Blob> {
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
      if (filtros.concesionariaId !== undefined) {
        params = params.set('concesionariaId', filtros.concesionariaId.toString());
      }
    }

    return this.apiService.get<Blob>('/admin/compras/exportar', {
      headers: this.getHeaders(),
      params,
      responseType: 'blob'
    });
  }
}

