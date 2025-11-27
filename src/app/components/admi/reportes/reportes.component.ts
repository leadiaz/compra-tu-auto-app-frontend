import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AdminReporteService, ReporteFiltros, ReporteTop5 } from '../../../services/admin-reporte.service';

@Component({
  selector: 'app-reportes-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesComponent implements OnInit {
  filtrosForm: FormGroup;
  isLoading = signal(false);
  
  autosMasVendidos = signal<any[]>([]);
  usuariosMasCompras = signal<any[]>([]);
  autosMejoresRankeados = signal<any[]>([]);
  agenciasMasVentas = signal<any[]>([]);

  constructor(
    private fb: FormBuilder,
    private adminReporteService: AdminReporteService
  ) {
    this.filtrosForm = this.fb.group({
      fechaDesde: [''],
      fechaHasta: [''],
      periodo: ['']
    });
  }

  ngOnInit(): void {
    this.cargarReportes();
  }

  cargarReportes(): void {
    this.isLoading.set(true);
    const filtros: ReporteFiltros = this.filtrosForm.value;
    
    // Limpiar valores vacíos
    Object.keys(filtros).forEach(key => {
      if (filtros[key as keyof ReporteFiltros] === '' || filtros[key as keyof ReporteFiltros] === null) {
        delete filtros[key as keyof ReporteFiltros];
      }
    });

    // Cargar todos los reportes en paralelo
    Promise.all([
      this.adminReporteService.obtenerAutosMasVendidos(filtros).toPromise(),
      this.adminReporteService.obtenerUsuariosMasCompras(filtros).toPromise(),
      this.adminReporteService.obtenerAutosMejoresRankeados(filtros).toPromise(),
      this.adminReporteService.obtenerAgenciasMasVentas(filtros).toPromise()
    ]).then(([autosVendidos, usuariosCompras, autosRankeados, agenciasVentas]) => {
      this.autosMasVendidos.set(autosVendidos?.items || []);
      this.usuariosMasCompras.set(usuariosCompras?.items || []);
      this.autosMejoresRankeados.set(autosRankeados?.items || []);
      this.agenciasMasVentas.set(agenciasVentas?.items || []);
      this.isLoading.set(false);
    }).catch((error) => {
      console.error('Error al cargar reportes:', error);
      this.isLoading.set(false);
      alert('Error al cargar los reportes. Por favor, intenta nuevamente.');
    });
  }

  aplicarFiltros(): void {
    this.cargarReportes();
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset({
      fechaDesde: '',
      fechaHasta: '',
      periodo: ''
    });
    this.cargarReportes();
  }

  exportarReporte(tipo: string, formato: 'excel' | 'pdf'): void {
    const filtros: ReporteFiltros = this.filtrosForm.value;
    
    // Limpiar valores vacíos
    Object.keys(filtros).forEach(key => {
      if (filtros[key as keyof ReporteFiltros] === '' || filtros[key as keyof ReporteFiltros] === null) {
        delete filtros[key as keyof ReporteFiltros];
      }
    });

    this.isLoading.set(true);
    this.adminReporteService.exportarReporte(tipo, formato, filtros).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-${tipo}.${formato === 'excel' ? 'xlsx' : 'pdf'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.isLoading.set(false);
        alert(`Reporte exportado exitosamente en formato ${formato.toUpperCase()}`);
      },
      error: (error) => {
        console.error('Error al exportar reporte:', error);
        alert('Error al exportar el reporte. Por favor, intenta nuevamente.');
        this.isLoading.set(false);
      }
    });
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(precio);
  }
}

