import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { Oferta, OfertaCreate, OfertaUpdate, OfertaFiltros } from '../models/oferta.model';

@Injectable({
  providedIn: 'root'
})
export class OfertaService {
  constructor(private apiService: ApiService) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Crea una nueva oferta (CONCESIONARIA)
   * POST /ofertas
   */
  crearOferta(oferta: OfertaCreate): Observable<Oferta> {
    return this.apiService.post<Oferta>('/ofertas', oferta, {
      headers: this.getHeaders()
    });
  }

  /**
   * Lista todas las ofertas (COMPRADOR)
   * GET /ofertas
   */
  listarOfertas(filtros?: OfertaFiltros): Observable<Oferta[]> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.concesionariaId !== undefined) {
        params = params.set('concesionariaId', filtros.concesionariaId.toString());
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
      if (filtros.moneda) {
        params = params.set('moneda', filtros.moneda);
      }
      if (filtros.stockMin !== undefined) {
        params = params.set('stockMin', filtros.stockMin.toString());
      }
    }

    return this.apiService.get<Oferta[]>('/ofertas', {
      headers: this.getHeaders(),
      params
    });
  }

  /**
   * Obtiene el detalle de una oferta
   * GET /ofertas/{id}
   */
  obtenerDetalleOferta(id: number): Observable<Oferta> {
    return this.apiService.get<Oferta>(`/ofertas/${id}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Lista ofertas por auto
   * GET /ofertas/autos/{autoId}
   */
  listarOfertasPorAuto(autoId: number): Observable<Oferta[]> {
    return this.apiService.get<Oferta[]>(`/ofertas/autos/${autoId}`, {
      headers: this.getHeaders()
    });
  }
}

