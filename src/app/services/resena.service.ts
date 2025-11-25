import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { ApiService } from './api.service';
import { Resena, ResenaRequest, ResenaUpdate } from '../models/resena.model';

@Injectable({
  providedIn: 'root'
})
export class ResenaService {
  constructor(private apiService: ApiService) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Crea una reseña (puntaje y/o comentario) para un auto favorito
   */
  crearResena(request: ResenaRequest): Observable<Resena> {
    return this.apiService.post<Resena>('/compradores/resenas', request, {
      headers: this.getHeaders()
    });
  }

  /**
   * Actualiza una reseña existente
   */
  actualizarResena(autoId: number, update: ResenaUpdate): Observable<Resena> {
    return this.apiService.put<Resena>(`/compradores/resenas/${autoId}`, update, {
      headers: this.getHeaders()
    });
  }

  /**
   * Elimina una reseña
   */
  eliminarResena(autoId: number): Observable<void> {
    return this.apiService.delete<void>(`/compradores/resenas/${autoId}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Obtiene la reseña del usuario para un auto específico
   */
  obtenerResena(autoId: number): Observable<Resena | null> {
    return this.apiService.get<Resena | null>(`/compradores/resenas/${autoId}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Lista todas las reseñas del usuario
   */
  listarResenas(): Observable<Resena[]> {
    return this.apiService.get<Resena[]>('/compradores/resenas', {
      headers: this.getHeaders()
    });
  }
}

