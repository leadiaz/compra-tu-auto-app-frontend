import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';

export interface ReporteTop5 {
  items: any[];
  periodo?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface AutoMasVendido {
  autoId: number;
  marca: string;
  modelo: string;
  año: number;
  cantidadVentas: number;
  precioPromedio: number;
  totalIngresos: number;
}

export interface UsuarioMasCompras {
  usuarioId: number;
  nombre: string;
  apellido: string;
  email: string;
  cantidadCompras: number;
  totalGastado: number;
}

export interface AutoMejorRankeado {
  autoId: number;
  marca: string;
  modelo: string;
  año: number;
  puntajePromedio: number;
  cantidadResenas: number;
}

export interface AgenciaMasVentas {
  concesionariaId: number;
  razonSocial: string;
  cantidadVentas: number;
  totalIngresos: number;
}

export interface ReporteFiltros {
  fechaDesde?: string;
  fechaHasta?: string;
  periodo?: 'mes' | 'trimestre' | 'año';
}

@Injectable({
  providedIn: 'root'
})
export class AdminReporteService {
  constructor(private apiService: ApiService) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Obtiene el reporte Top 5 autos más vendidos
   */
  obtenerAutosMasVendidos(filtros?: ReporteFiltros): Observable<ReporteTop5> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.fechaDesde) {
        params = params.set('fechaDesde', filtros.fechaDesde);
      }
      if (filtros.fechaHasta) {
        params = params.set('fechaHasta', filtros.fechaHasta);
      }
      if (filtros.periodo) {
        params = params.set('periodo', filtros.periodo);
      }
    }

    return this.apiService.get<ReporteTop5>('/admin/reportes/autos-mas-vendidos', {
      headers: this.getHeaders(),
      params
    });
  }

  /**
   * Obtiene el reporte Top 5 usuarios con más compras
   */
  obtenerUsuariosMasCompras(filtros?: ReporteFiltros): Observable<ReporteTop5> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.fechaDesde) {
        params = params.set('fechaDesde', filtros.fechaDesde);
      }
      if (filtros.fechaHasta) {
        params = params.set('fechaHasta', filtros.fechaHasta);
      }
      if (filtros.periodo) {
        params = params.set('periodo', filtros.periodo);
      }
    }

    return this.apiService.get<ReporteTop5>('/admin/reportes/usuarios-mas-compras', {
      headers: this.getHeaders(),
      params
    });
  }

  /**
   * Obtiene el reporte Top 5 autos mejores rankeados
   */
  obtenerAutosMejoresRankeados(filtros?: ReporteFiltros): Observable<ReporteTop5> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.fechaDesde) {
        params = params.set('fechaDesde', filtros.fechaDesde);
      }
      if (filtros.fechaHasta) {
        params = params.set('fechaHasta', filtros.fechaHasta);
      }
      if (filtros.periodo) {
        params = params.set('periodo', filtros.periodo);
      }
    }

    return this.apiService.get<ReporteTop5>('/admin/reportes/autos-mejores-rankeados', {
      headers: this.getHeaders(),
      params
    });
  }

  /**
   * Obtiene el reporte Top 5 agencias con más ventas
   */
  obtenerAgenciasMasVentas(filtros?: ReporteFiltros): Observable<ReporteTop5> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.fechaDesde) {
        params = params.set('fechaDesde', filtros.fechaDesde);
      }
      if (filtros.fechaHasta) {
        params = params.set('fechaHasta', filtros.fechaHasta);
      }
      if (filtros.periodo) {
        params = params.set('periodo', filtros.periodo);
      }
    }

    return this.apiService.get<ReporteTop5>('/admin/reportes/agencias-mas-ventas', {
      headers: this.getHeaders(),
      params
    });
  }

  /**
   * Exporta un reporte en formato Excel o PDF
   */
  exportarReporte(tipoReporte: string, formato: 'excel' | 'pdf', filtros?: ReporteFiltros): Observable<Blob> {
    let params = new HttpParams()
      .set('tipo', tipoReporte)
      .set('formato', formato);
    
    if (filtros) {
      if (filtros.fechaDesde) {
        params = params.set('fechaDesde', filtros.fechaDesde);
      }
      if (filtros.fechaHasta) {
        params = params.set('fechaHasta', filtros.fechaHasta);
      }
      if (filtros.periodo) {
        params = params.set('periodo', filtros.periodo);
      }
    }

    return this.apiService.get<Blob>('/admin/reportes/exportar', {
      headers: this.getHeaders(),
      params,
      responseType: 'blob'
    });
  }
}

