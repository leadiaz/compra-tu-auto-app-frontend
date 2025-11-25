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
   * Agrega un auto a favoritos
   */
  agregarFavorito(request: FavoritoRequest): Observable<Favorito> {
    return this.apiService.post<Favorito>('/compradores/favoritos', request, {
      headers: this.getHeaders()
    });
  }

  /**
   * Elimina un auto de favoritos
   */
  eliminarFavorito(autoId: number): Observable<void> {
    return this.apiService.delete<void>(`/compradores/favoritos/${autoId}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Lista todos los favoritos del usuario
   */
  listarFavoritos(): Observable<Favorito[]> {
    return this.apiService.get<Favorito[]>('/compradores/favoritos', {
      headers: this.getHeaders()
    });
  }

  /**
   * Verifica si un auto está en favoritos
   */
  esFavorito(autoId: number): Observable<boolean> {
    return this.apiService.get<boolean>(`/compradores/favoritos/${autoId}/existe`, {
      headers: this.getHeaders()
    });
  }
}

