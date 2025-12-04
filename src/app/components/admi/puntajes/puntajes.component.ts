import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AdminResenaService, ResenaAdminFiltros } from '../../../services/admin-resena.service';
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
  todasLasResenas = signal<Resena[]>([]);
  isLoading = signal(false);
  currentPage = signal(0);
  pageSize = signal(10);
  
  mostrarFiltros = signal(false);
  resenaSeleccionada = signal<Resena | null>(null);
  mostrarModalDetalle = signal(false);
  mostrarModalEliminar = signal(false);

  // Reseñas filtradas y paginadas
  puntajesFiltrados = computed(() => {
    let resenas = [...this.todasLasResenas()];
    const filtros = this.filtrosForm.value;

    // Aplicar filtros
    if (filtros.usuarioId) {
      resenas = resenas.filter(r => r.usuarioId === filtros.usuarioId);
    }
    if (filtros.autoId) {
      resenas = resenas.filter(r => r.autoId === filtros.autoId);
    }
    if (filtros.puntajeMin !== null && filtros.puntajeMin !== undefined) {
      resenas = resenas.filter(r => r.puntaje >= filtros.puntajeMin);
    }
    if (filtros.puntajeMax !== null && filtros.puntajeMax !== undefined) {
      resenas = resenas.filter(r => r.puntaje <= filtros.puntajeMax);
    }
    if (filtros.fechaDesde) {
      const fechaDesde = new Date(filtros.fechaDesde);
      resenas = resenas.filter(r => new Date(r.fechaCreacion) >= fechaDesde);
    }
    if (filtros.fechaHasta) {
      const fechaHasta = new Date(filtros.fechaHasta);
      fechaHasta.setHours(23, 59, 59, 999);
      resenas = resenas.filter(r => new Date(r.fechaCreacion) <= fechaHasta);
    }
    if (filtros.palabraClave) {
      const palabra = filtros.palabraClave.toLowerCase();
      resenas = resenas.filter(r => 
        r.comentario?.toLowerCase().includes(palabra) ||
        r.autoMarca.toLowerCase().includes(palabra) ||
        r.autoModelo.toLowerCase().includes(palabra) ||
        r.usuarioNombre.toLowerCase().includes(palabra) ||
        r.usuarioApellido.toLowerCase().includes(palabra)
      );
    }

    // Ordenar
    const sortBy = filtros.sortBy || 'fechaCreacion';
    const sortOrder = filtros.sortOrder || 'DESC';
    resenas.sort((a, b) => {
      let aVal: any = a[sortBy as keyof Resena];
      let bVal: any = b[sortBy as keyof Resena];
      
      if (sortBy === 'fechaCreacion' || sortBy === 'fechaActualizacion') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      
      if (sortOrder === 'ASC') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    return resenas;
  });

  puntajes = computed(() => {
    const inicio = this.currentPage() * this.pageSize();
    const fin = inicio + this.pageSize();
    return this.puntajesFiltrados().slice(inicio, fin);
  });

  totalElements = computed(() => this.puntajesFiltrados().length);
  totalPages = computed(() => Math.ceil(this.totalElements() / this.pageSize()));

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
    this.adminResenaService.listarTodasResenas().subscribe({
      next: (resenas) => {
        this.todasLasResenas.set(resenas);
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
    // Los filtros se aplican automáticamente mediante computed
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
    this.adminResenaService.eliminarPuntaje(resena.autoId).subscribe({
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

