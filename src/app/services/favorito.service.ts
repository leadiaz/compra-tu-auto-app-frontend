import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { ApiService } from './api.service';
import { Favorito, FavoritoRequest } from '../models/favorito.model';

@Injectable({
  providedIn: 'root'
})
export class FavoritoService {
  constructor(private apiService: ApiService) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Lista todos los favoritos del usuario autenticado (COMPRADOR)
   * GET /favoritos
   */
  listarFavoritos(): Observable<Favorito[]> {
    return this.apiService.get<Favorito[]>('/favoritos', {
      headers: this.getHeaders()
    });
  }

  /**
   * Agrega una oferta como favorita (COMPRADOR)
   * POST /favoritos
   */
  agregarFavorito(request: FavoritoRequest): Observable<Favorito> {
    return this.apiService.post<Favorito>('/favoritos', request, {
      headers: this.getHeaders()
    });
  }

  /**
   * Elimina una oferta de favoritos (COMPRADOR)
   * DELETE /favoritos/{ofertaId}
   */
  eliminarFavorito(ofertaId: number): Observable<void> {
    return this.apiService.delete<void>(`/favoritos/${ofertaId}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Lista todos los favoritos del sistema (ADMIN)
   * GET /favoritos/admin
   */
  listarTodosFavoritos(): Observable<Favorito[]> {
    return this.apiService.get<Favorito[]>('/favoritos/admin', {
      headers: this.getHeaders()
    });
  }

  /**
   * Lista favoritos por oferta (ADMIN)
   * GET /favoritos/admin/oferta/{ofertaId}
   */
  listarFavoritosPorOferta(ofertaId: number): Observable<Favorito[]> {
    return this.apiService.get<Favorito[]>(`/favoritos/admin/oferta/${ofertaId}`, {
      headers: this.getHeaders()
    });
  }
}

