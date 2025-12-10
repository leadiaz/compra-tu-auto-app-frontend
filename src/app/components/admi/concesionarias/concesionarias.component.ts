import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminConcesionariaService } from '../../../services/admin-concesionaria.service';
import { AdminUsuarioService } from '../../../services/admin-usuario.service';
import { ConcesionariaAdmin, ConcesionariaAdminCreate, ConcesionariaAdminUpdate } from '../../../models/concesionaria-admin.model';
import { UsuarioAdmin } from '../../../models/usuario-admin.model';
import { TipoUsuario } from '../../../models/auth.model';

@Component({
  selector: 'app-concesionarias-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './concesionarias.component.html',
  styleUrl: './concesionarias.component.css'
})
export class ConcesionariasComponent implements OnInit {
  filtrosForm: FormGroup;
  concesionarias = signal<ConcesionariaAdmin[]>([]);
  concesionariasFiltradas = signal<ConcesionariaAdmin[]>([]);
  concesionariasPaginadas = signal<ConcesionariaAdmin[]>([]);
  isLoading = signal(false);
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(0);
  pageSize = signal(10);
  
  mostrarFiltros = signal(false);
  mostrarModalCrear = signal(false);
  mostrarModalEditar = signal(false);
  mostrarModalEliminar = signal(false);
  mostrarModalActivar = signal(false);
  mostrarModalDesactivar = signal(false);
  mostrarModalDetalle = signal(false);
  mostrarModalUsuarios = signal(false);
  
  concesionariaSeleccionada = signal<ConcesionariaAdmin | null>(null);
  usuariosConcesionaria = signal<UsuarioAdmin[]>([]);
  usuariosDisponibles = signal<UsuarioAdmin[]>([]);
  
  concesionariaForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly adminConcesionariaService: AdminConcesionariaService,
    private readonly adminUsuarioService: AdminUsuarioService,
    private readonly router: Router
  ) {
    this.filtrosForm = this.fb.group({
      activa: [null],
      palabraClave: [''],
      sortBy: ['nombre'],
      sortOrder: ['ASC']
    });

    this.concesionariaForm = this.fb.group({
      nombre: ['', Validators.required],
      cuit: ['', Validators.required],
      direccion: [''],
      telefono: [''],
      email: [''],
      usuarioId: [null]
    });
  }

  ngOnInit(): void {
    this.cargarUsuariosDisponibles();
    this.cargarConcesionarias();
  }

  cargarUsuariosDisponibles(): void {
    // Cargar usuarios de tipo CONCESIONARIA que no tengan concesionaria asociada
    this.adminUsuarioService.listarUsuarios({ 
      tipoUsuario: TipoUsuario.CONCESIONARIO,
      sinConcesionaria: true
    }).subscribe({
      next: (usuarios) => {
        this.usuariosDisponibles.set(usuarios);
      },
      error: (error) => {
        console.error('Error al cargar usuarios disponibles:', error);
      }
    });
  }

  cargarConcesionarias(): void {
    this.isLoading.set(true);
    
    this.adminConcesionariaService.listarConcesionarias().subscribe({
      next: (concesionarias: ConcesionariaAdmin[]) => {
        this.concesionarias.set(concesionarias);
        this.aplicarFiltros();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar concesionarias:', error);
        this.isLoading.set(false);
        alert('Error al cargar las concesionarias. Por favor, intenta nuevamente.');
      }
    });
  }

  aplicarFiltros(): void {
    let filtradas = [...this.concesionarias()];
    const filtros = this.filtrosForm.value;

    // Filtrar por estado activa
    if (filtros.activa !== null && filtros.activa !== undefined) {
      filtradas = filtradas.filter(c => c.activa === filtros.activa);
    }

    // Filtrar por palabra clave
    if (filtros.palabraClave && filtros.palabraClave.trim() !== '') {
      const palabraClave = filtros.palabraClave.toLowerCase();
      filtradas = filtradas.filter(c => 
        c.nombre.toLowerCase().includes(palabraClave) ||
        c.direccion?.toLowerCase().includes(palabraClave) ||
        c.cuit?.toLowerCase().includes(palabraClave) ||
        c.email?.toLowerCase().includes(palabraClave)
      );
    }

    // Ordenar
    if (filtros.sortBy) {
      filtradas.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (filtros.sortBy === 'fechaAlta') {
          aValue = new Date(a.fechaAlta).getTime();
          bValue = new Date(b.fechaAlta).getTime();
        } else {
          aValue = a.nombre.toLowerCase();
          bValue = b.nombre.toLowerCase();
        }

        if (filtros.sortOrder === 'DESC') {
          if (aValue > bValue) {
            return -1;
          }
          if (aValue < bValue) {
            return 1;
          }
          return 0;
        } else {
          if (aValue < bValue) {
            return -1;
          }
          if (aValue > bValue) {
            return 1;
          }
          return 0;
        }
      });
    }

    this.concesionariasFiltradas.set(filtradas);
    this.totalElements.set(filtradas.length);
    this.totalPages.set(Math.ceil(filtradas.length / this.pageSize()));
    this.aplicarPaginacion();
  }

  aplicarPaginacion(): void {
    const inicio = this.currentPage() * this.pageSize();
    const fin = inicio + this.pageSize();
    const paginadas = this.concesionariasFiltradas().slice(inicio, fin);
    this.concesionariasPaginadas.set(paginadas);
  }

  buscar(): void {
    this.currentPage.set(0);
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset({
      activa: null,
      palabraClave: '',
      sortBy: 'nombre',
      sortOrder: 'ASC'
    });
    this.buscar();
  }

  toggleFiltros(): void {
    this.mostrarFiltros.update(val => !val);
  }

  irAPagina(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
      this.aplicarPaginacion();
    }
  }

  abrirModalCrear(): void {
    this.cargarUsuariosDisponibles(); // Recargar usuarios disponibles
    this.concesionariaForm.reset({
      nombre: '',
      cuit: '',
      direccion: '',
      telefono: '',
      email: '',
      usuarioId: null
    });
    this.mostrarModalCrear.set(true);
  }

  crearConcesionaria(): void {
    if (this.concesionariaForm.valid) {
      this.isLoading.set(true);
      const formValue = this.concesionariaForm.value;
      const concesionariaData: ConcesionariaAdminCreate = {
        nombre: formValue.nombre,
        cuit: formValue.cuit,
        direccion: formValue.direccion || undefined,
        telefono: formValue.telefono || undefined,
        email: formValue.email || undefined,
        usuarioId: formValue.usuarioId || undefined
      };
      
      // Limpiar campos opcionales vacíos
      if (!concesionariaData.direccion) delete concesionariaData.direccion;
      if (!concesionariaData.telefono) delete concesionariaData.telefono;
      if (!concesionariaData.email) delete concesionariaData.email;
      if (!concesionariaData.usuarioId) delete concesionariaData.usuarioId;
      
      this.adminConcesionariaService.crearConcesionaria(concesionariaData).subscribe({
        next: () => {
          alert('Concesionaria creada exitosamente');
          this.mostrarModalCrear.set(false);
          this.cargarConcesionarias();
          this.cargarUsuariosDisponibles(); // Recargar usuarios disponibles
        },
        error: (error) => {
          console.error('Error al crear concesionaria:', error);
          let mensaje = 'Error al crear la concesionaria. Por favor, intenta nuevamente.';
          if (error.error?.message) {
            mensaje = error.error.message;
          }
          alert(mensaje);
          this.isLoading.set(false);
        }
      });
    }
  }

  abrirModalEditar(concesionaria: ConcesionariaAdmin): void {
    this.concesionariaSeleccionada.set(concesionaria);
    this.concesionariaForm.patchValue({
      nombre: concesionaria.nombre,
      cuit: concesionaria.cuit,
      direccion: concesionaria.direccion || '',
      telefono: concesionaria.telefono || '',
      email: concesionaria.email || '',
      usuarioId: null // No recibimos el ID en la respuesta, debe seleccionarse manualmente si se desea cambiar
    });
    this.mostrarModalEditar.set(true);
  }

  editarConcesionaria(): void {
    if (this.concesionariaForm.valid && this.concesionariaSeleccionada()) {
      this.isLoading.set(true);
      const concesionariaData: ConcesionariaAdminUpdate = this.concesionariaForm.value;
      
      this.adminConcesionariaService.actualizarConcesionaria(
        this.concesionariaSeleccionada()!.id, 
        concesionariaData
      ).subscribe({
        next: () => {
          alert('Concesionaria actualizada exitosamente');
          this.mostrarModalEditar.set(false);
          this.concesionariaSeleccionada.set(null);
          this.cargarConcesionarias();
        },
        error: (error) => {
          console.error('Error al actualizar concesionaria:', error);
          alert('Error al actualizar la concesionaria. Por favor, intenta nuevamente.');
          this.isLoading.set(false);
        }
      });
    }
  }

  confirmarEliminar(concesionaria: ConcesionariaAdmin): void {
    this.concesionariaSeleccionada.set(concesionaria);
    this.mostrarModalEliminar.set(true);
  }

  eliminarConcesionaria(): void {
    const concesionaria = this.concesionariaSeleccionada();
    if (!concesionaria) return;

    this.isLoading.set(true);
    this.adminConcesionariaService.eliminarConcesionaria(concesionaria.id).subscribe({
      next: () => {
        alert('Concesionaria eliminada exitosamente');
        this.mostrarModalEliminar.set(false);
        this.concesionariaSeleccionada.set(null);
        this.cargarConcesionarias();
      },
      error: (error) => {
        console.error('Error al eliminar concesionaria:', error);
        alert('Error al eliminar la concesionaria. Por favor, intenta nuevamente.');
        this.isLoading.set(false);
      }
    });
  }

  confirmarActivar(concesionaria: ConcesionariaAdmin): void {
    this.concesionariaSeleccionada.set(concesionaria);
    this.mostrarModalActivar.set(true);
  }

  activarConcesionaria(): void {
    const concesionaria = this.concesionariaSeleccionada();
    if (!concesionaria) return;

    this.isLoading.set(true);
    this.adminConcesionariaService.activarConcesionaria(concesionaria.id).subscribe({
      next: () => {
        alert('Concesionaria activada exitosamente');
        this.mostrarModalActivar.set(false);
        this.concesionariaSeleccionada.set(null);
        this.cargarConcesionarias();
      },
      error: (error) => {
        console.error('Error al activar concesionaria:', error);
        alert('Error al activar la concesionaria. Por favor, intenta nuevamente.');
        this.isLoading.set(false);
      }
    });
  }

  confirmarDesactivar(concesionaria: ConcesionariaAdmin): void {
    this.concesionariaSeleccionada.set(concesionaria);
    this.mostrarModalDesactivar.set(true);
  }

  desactivarConcesionaria(): void {
    const concesionaria = this.concesionariaSeleccionada();
    if (!concesionaria) return;

    this.isLoading.set(true);
    this.adminConcesionariaService.desactivarConcesionaria(concesionaria.id).subscribe({
      next: () => {
        alert('Concesionaria desactivada exitosamente');
        this.mostrarModalDesactivar.set(false);
        this.concesionariaSeleccionada.set(null);
        this.cargarConcesionarias();
      },
      error: (error) => {
        console.error('Error al desactivar concesionaria:', error);
        alert('Error al desactivar la concesionaria. Por favor, intenta nuevamente.');
        this.isLoading.set(false);
      }
    });
  }

  verDetalle(concesionaria: ConcesionariaAdmin): void {
    this.concesionariaSeleccionada.set(concesionaria);
    this.mostrarModalDetalle.set(true);
  }

  verUsuarios(concesionaria: ConcesionariaAdmin): void {
    this.concesionariaSeleccionada.set(concesionaria);
    this.isLoading.set(true);
    this.adminConcesionariaService.obtenerUsuariosConcesionaria(concesionaria.id).subscribe({
      next: (usuarios) => {
        this.usuariosConcesionaria.set(usuarios);
        this.mostrarModalUsuarios.set(true);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar usuarios de concesionaria:', error);
        alert('Error al cargar los usuarios. Por favor, intenta nuevamente.');
        this.isLoading.set(false);
      }
    });
  }

  cerrarModales(): void {
    this.mostrarModalCrear.set(false);
    this.mostrarModalEditar.set(false);
    this.mostrarModalEliminar.set(false);
    this.mostrarModalActivar.set(false);
    this.mostrarModalDesactivar.set(false);
    this.mostrarModalDetalle.set(false);
    this.mostrarModalUsuarios.set(false);
    this.concesionariaSeleccionada.set(null);
    this.usuariosConcesionaria.set([]);
  }

  formatearFecha(fecha?: string): string {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  exportarConcesionarias(formato: 'excel' | 'pdf'): void {
    // Exportar las concesionarias filtradas actuales
    const concesionariasAExportar = this.concesionariasFiltradas();
    
    if (concesionariasAExportar.length === 0) {
      alert('No hay concesionarias para exportar con los filtros seleccionados.');
      return;
    }

    this.isLoading.set(true);
    // Nota: Si el backend requiere filtros, se pueden pasar, pero según la documentación
    // el endpoint de exportación podría no existir aún. Por ahora, exportamos las filtradas del cliente.
    // Si el backend tiene endpoint de exportación, se debería usar ese.
    this.adminConcesionariaService.exportarConcesionarias(formato, {}).subscribe({
      next: (blob) => {
        const url = globalThis.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `concesionarias.${formato === 'excel' ? 'xlsx' : 'pdf'}`;
        document.body.appendChild(a);
        a.click();
        globalThis.URL.revokeObjectURL(url);
        a.remove();
        this.isLoading.set(false);
        alert(`Concesionarias exportadas exitosamente en formato ${formato.toUpperCase()}`);
      },
      error: (error) => {
        console.error('Error al exportar concesionarias:', error);
        alert('Error al exportar las concesionarias. Por favor, intenta nuevamente.');
        this.isLoading.set(false);
      }
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.concesionariaForm.get(fieldName);
    
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return 'Este campo es requerido';
      }
    }
    
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.concesionariaForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }
}

