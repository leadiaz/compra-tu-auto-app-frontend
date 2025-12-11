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
   * GET /ofertas/mis-ofertas
   */
  listarMisOfertas(filtros?: OfertaFiltros): Observable<Oferta[]> {
    // El endpoint /ofertas/mis-ofertas retorna todas las ofertas de la concesionaria autenticada
    // Los filtros se aplicarán en el frontend después de recibir los datos
    return this.apiService.get<Oferta[]>('/ofertas/mis-ofertas', {
      headers: this.getHeaders()
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

