import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { Oferta, OfertaCreate, OfertaUpdate, OfertaFiltros } from '../models/oferta.model';

@Injectable({
  providedIn: 'root'
})
export class ConcesionariaOfertaService {
  constructor(private apiService: ApiService) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Crea una nueva oferta para la concesionaria autenticada
   * POST /ofertas
   */
  crearOferta(oferta: OfertaCreate): Observable<Oferta> {
    return this.apiService.post<Oferta>('/ofertas', oferta, {
      headers: this.getHeaders()
    });
  }

  /**
   * Lista todas las ofertas de la concesionaria autenticada
   * GET /ofertas?concesionariaId={id} o GET /concesionarias/mis-ofertas
   */
  listarMisOfertas(filtros?: OfertaFiltros): Observable<Oferta[]> {
    let params = new HttpParams();
    
    if (filtros) {
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

    // Asumimos que existe un endpoint específico para concesionarias
    // Si no existe, usaríamos /ofertas con filtro de concesionariaId
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
   * Actualiza una oferta
   * PUT /ofertas/{id}
   */
  actualizarOferta(id: number, oferta: OfertaUpdate): Observable<Oferta> {
    return this.apiService.put<Oferta>(`/ofertas/${id}`, oferta, {
      headers: this.getHeaders()
    });
  }

  /**
   * Elimina una oferta
   * DELETE /ofertas/{id}
   */
  eliminarOferta(id: number): Observable<void> {
    return this.apiService.delete<void>(`/ofertas/${id}`, {
      headers: this.getHeaders()
    });
  }
}

