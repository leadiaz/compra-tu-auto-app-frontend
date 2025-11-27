import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AdminResenaService, ResenaAdminFiltros, ResenaAdminResponse } from '../../../services/admin-resena.service';
import { Resena } from '../../../models/resena.model';

@Component({
  selector: 'app-puntajes-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './puntajes.component.html',
  styleUrl: './puntajes.component.css'
})
export class PuntajesComponent implements OnInit {
  filtrosForm: FormGroup;
  puntajes = signal<Resena[]>([]);
  isLoading = signal(false);
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(0);
  pageSize = signal(10);
  
  mostrarFiltros = signal(false);
  resenaSeleccionada = signal<Resena | null>(null);
  mostrarModalDetalle = signal(false);
  mostrarModalEliminar = signal(false);

  constructor(
    private fb: FormBuilder,
    private adminResenaService: AdminResenaService
  ) {
    this.filtrosForm = this.fb.group({
      usuarioId: [null],
      autoId: [null],
      puntajeMin: [null],
      puntajeMax: [null],
      fechaDesde: [''],
      fechaHasta: [''],
      palabraClave: [''],
      sortBy: ['fechaCreacion'],
      sortOrder: ['DESC']
    });
  }

  ngOnInit(): void {
    this.cargarPuntajes();
  }

  cargarPuntajes(): void {
    this.isLoading.set(true);
    const filtros: ResenaAdminFiltros = {
      ...this.filtrosForm.value,
      page: this.currentPage(),
      size: this.pageSize()
    };

    // Limpiar valores vacíos
    Object.keys(filtros).forEach(key => {
      if (filtros[key as keyof ResenaAdminFiltros] === '' || filtros[key as keyof ResenaAdminFiltros] === null) {
        delete filtros[key as keyof ResenaAdminFiltros];
      }
    });

    this.adminResenaService.consultarPuntajes(filtros).subscribe({
      next: (response: ResenaAdminResponse) => {
        this.puntajes.set(response.content);
        this.totalElements.set(response.totalElements);
        this.totalPages.set(response.totalPages);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar puntajes:', error);
        this.isLoading.set(false);
        alert('Error al cargar los puntajes. Por favor, intenta nuevamente.');
      }
    });
  }

  buscar(): void {
    this.currentPage.set(0);
    this.cargarPuntajes();
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset({
      usuarioId: null,
      autoId: null,
      puntajeMin: null,
      puntajeMax: null,
      fechaDesde: '',
      fechaHasta: '',
      palabraClave: '',
      sortBy: 'fechaCreacion',
      sortOrder: 'DESC'
    });
    this.buscar();
  }

  toggleFiltros(): void {
    this.mostrarFiltros.update(val => !val);
  }

  irAPagina(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
      this.cargarPuntajes();
    }
  }

  verDetalle(resena: Resena): void {
    this.resenaSeleccionada.set(resena);
    this.mostrarModalDetalle.set(true);
  }

  confirmarEliminar(resena: Resena): void {
    this.resenaSeleccionada.set(resena);
    this.mostrarModalEliminar.set(true);
  }

  eliminarPuntaje(): void {
    const resena = this.resenaSeleccionada();
    if (!resena) return;

    this.isLoading.set(true);
    this.adminResenaService.eliminarPuntaje(resena.id).subscribe({
      next: () => {
        alert('Reseña eliminada exitosamente');
        this.mostrarModalEliminar.set(false);
        this.resenaSeleccionada.set(null);
        this.cargarPuntajes();
      },
      error: (error) => {
        console.error('Error al eliminar reseña:', error);
        alert('Error al eliminar la reseña. Por favor, intenta nuevamente.');
        this.isLoading.set(false);
      }
    });
  }

  cerrarModales(): void {
    this.mostrarModalDetalle.set(false);
    this.mostrarModalEliminar.set(false);
    this.resenaSeleccionada.set(null);
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  exportarPuntajes(formato: 'excel' | 'pdf'): void {
    const filtros: ResenaAdminFiltros = this.filtrosForm.value;
    
    // Limpiar valores vacíos
    Object.keys(filtros).forEach(key => {
      if (filtros[key as keyof ResenaAdminFiltros] === '' || filtros[key as keyof ResenaAdminFiltros] === null) {
        delete filtros[key as keyof ResenaAdminFiltros];
      }
    });

    this.isLoading.set(true);
    this.adminResenaService.exportarPuntajes(formato, filtros).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `puntajes.${formato === 'excel' ? 'xlsx' : 'pdf'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.isLoading.set(false);
        alert(`Puntajes exportados exitosamente en formato ${formato.toUpperCase()}`);
      },
      error: (error) => {
        console.error('Error al exportar puntajes:', error);
        alert('Error al exportar los puntajes. Por favor, intenta nuevamente.');
        this.isLoading.set(false);
      }
    });
  }
}

