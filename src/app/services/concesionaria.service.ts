import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { ApiService } from './api.service';
import { Concesionaria, ConcesionariaUpdate } from '../models/concesionaria.model';

@Injectable({
  providedIn: 'root'
})
export class ConcesionariaService {
  constructor(private apiService: ApiService) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Obtiene la información de la concesionaria del usuario autenticado
   */
  obtenerMiConcesionaria(): Observable<Concesionaria> {
    return this.apiService.get<Concesionaria>('/concesionarias/mi-concesionaria', {
      headers: this.getHeaders()
    });
  }

  /**
   * Actualiza la información de la concesionaria
   */
  actualizarConcesionaria(update: ConcesionariaUpdate): Observable<Concesionaria> {
    return this.apiService.put<Concesionaria>('/concesionarias/mi-concesionaria', update, {
      headers: this.getHeaders()
    });
  }
}



