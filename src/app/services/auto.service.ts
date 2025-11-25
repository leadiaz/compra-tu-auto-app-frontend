import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { Auto, FiltrosBusqueda, BusquedaResponse } from '../models/auto.model';

@Injectable({
  providedIn: 'root'
})
export class AutoService {
  constructor(private apiService: ApiService) {}

  /**
   * Lista todos los autos disponibles
   */
  listarAutos(page: number = 0, size: number = 10): Observable<BusquedaResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.apiService.get<BusquedaResponse>('/autos', { params });
  }

  /**
   * Busca autos con filtros avanzados
   */
  buscarAutos(filtros: FiltrosBusqueda): Observable<BusquedaResponse> {
    let params = new HttpParams();
    
    if (filtros.palabraClave) {
      params = params.set('palabraClave', filtros.palabraClave);
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
    if (filtros.modelo) {
      params = params.set('modelo', filtros.modelo);
    }
    if (filtros.añoMin !== undefined) {
      params = params.set('añoMin', filtros.añoMin.toString());
    }
    if (filtros.añoMax !== undefined) {
      params = params.set('añoMax', filtros.añoMax.toString());
    }
    if (filtros.kilometrajeMin !== undefined) {
      params = params.set('kilometrajeMin', filtros.kilometrajeMin.toString());
    }
    if (filtros.kilometrajeMax !== undefined) {
      params = params.set('kilometrajeMax', filtros.kilometrajeMax.toString());
    }
    if (filtros.combustible) {
      params = params.set('combustible', filtros.combustible);
    }
    if (filtros.transmision) {
      params = params.set('transmision', filtros.transmision);
    }
    if (filtros.concesionariaId !== undefined) {
      params = params.set('concesionariaId', filtros.concesionariaId.toString());
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

    return this.apiService.get<BusquedaResponse>('/autos/buscar', { params });
  }

  /**
   * Obtiene el detalle de un auto por ID
   */
  obtenerDetalleAuto(id: number): Observable<Auto> {
    return this.apiService.get<Auto>(`/autos/${id}`);
  }

  /**
   * Obtiene las marcas disponibles
   */
  obtenerMarcas(): Observable<string[]> {
    return this.apiService.get<string[]>('/autos/marcas');
  }

  /**
   * Obtiene los modelos disponibles para una marca
   */
  obtenerModelosPorMarca(marca: string): Observable<string[]> {
    const params = new HttpParams().set('marca', marca);
    return this.apiService.get<string[]>('/autos/modelos', { params });
  }
}

