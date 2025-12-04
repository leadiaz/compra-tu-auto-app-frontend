import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { Compra, CompraRequest, CompraFiltros } from '../models/compra.model';

@Injectable({
  providedIn: 'root'
})
export class CompraService {
  constructor(private apiService: ApiService) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Registra una compra de auto
   */
  registrarCompra(request: CompraRequest): Observable<Compra> {
    return this.apiService.post<Compra>('/compradores/compras', request, {
      headers: this.getHeaders()
    });
  }

  /**
   * Obtiene el historial de compras del usuario
   */
  obtenerHistorialCompras(filtros?: CompraFiltros): Observable<Compra[]> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.fechaDesde) {
        params = params.set('fechaDesde', filtros.fechaDesde);
      }
      if (filtros.fechaHasta) {
        params = params.set('fechaHasta', filtros.fechaHasta);
      }
      if (filtros.concesionariaId !== undefined) {
        params = params.set('concesionariaId', filtros.concesionariaId.toString());
      }
      if (filtros.marca) {
        params = params.set('marca', filtros.marca);
      }
      if (filtros.precioMin !== undefined) {
        params = params.set('precioMin', filtros.precioMin.toString());
      }
      if (filtros.precioMax !== undefined) {
        params = params.set('precioMax', filtros.precioMax.toString());
      }
    }

    return this.apiService.get<Compra[]>('/compradores/compras', {
      headers: this.getHeaders(),
      params
    });
  }

  /**
   * Obtiene el detalle de una compra específica
   */
  obtenerDetalleCompra(compraId: number): Observable<Compra> {
    return this.apiService.get<Compra>(`/compradores/compras/${compraId}`, {
      headers: this.getHeaders()
    });
  }
}

