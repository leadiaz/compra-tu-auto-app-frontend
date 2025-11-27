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
   * Lista todas las reseñas del usuario autenticado (COMPRADOR)
   * GET /resenas/mias
   */
  listarMisResenas(): Observable<Resena[]> {
    return this.apiService.get<Resena[]>('/resenas/mias', {
      headers: this.getHeaders()
    });
  }

  /**
   * Crea una nueva reseña para un auto (COMPRADOR)
   * POST /resenas
   */
  crearResena(request: ResenaRequest): Observable<Resena> {
    return this.apiService.post<Resena>('/resenas', request, {
      headers: this.getHeaders()
    });
  }

  /**
   * Actualiza una reseña existente del usuario autenticado (COMPRADOR)
   * PUT /resenas/{autoId}
   */
  actualizarResena(autoId: number, update: ResenaUpdate): Observable<Resena> {
    return this.apiService.put<Resena>(`/resenas/${autoId}`, update, {
      headers: this.getHeaders()
    });
  }

  /**
   * Elimina una reseña del usuario autenticado (COMPRADOR)
   * DELETE /resenas/{autoId}
   */
  eliminarResena(autoId: number): Observable<void> {
    return this.apiService.delete<void>(`/resenas/${autoId}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Lista todas las reseñas de un auto específico (COMPRADOR, CONCESIONARIA, ADMIN)
   * GET /resenas/auto/{autoId}
   */
  listarResenasPorAuto(autoId: number): Observable<Resena[]> {
    return this.apiService.get<Resena[]>(`/resenas/auto/${autoId}`, {
      headers: this.getHeaders()
    });
  }
}

