import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminAutoService } from '../../../services/admin-auto.service';
import { AutoBase, AutoBaseCreate } from '../../../models/auto-base.model';

@Component({
  selector: 'app-gestion-autos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './gestion-autos.component.html',
  styleUrl: './gestion-autos.component.css'
})
export class GestionAutosComponent implements OnInit {
  autos = signal<AutoBase[]>([]);
  autosFiltrados = signal<AutoBase[]>([]);
  autosPaginados = signal<AutoBase[]>([]);
  isLoading = signal(false);
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(0);
  pageSize = signal(10);
  
  mostrarFiltros = signal(false);
  mostrarModalCrear = signal(false);
  mostrarModalEliminar = signal(false);
  
  autoSeleccionado = signal<AutoBase | null>(null);
  
  filtrosForm: FormGroup;
  autoForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private adminAutoService: AdminAutoService,
    private router: Router
  ) {
    this.filtrosForm = this.fb.group({
      palabraClave: [''],
      marca: [''],
      modelo: [''],
      sortBy: ['marca'],
      sortOrder: ['ASC']
    });

    this.autoForm = this.fb.group({
      marca: ['', [Validators.required, Validators.maxLength(100)]],
      modelo: ['', [Validators.required, Validators.maxLength(100)]],
      anioModelo: [new Date().getFullYear(), [Validators.required, Validators.min(1900)]]
    });
  }

  ngOnInit(): void {
    this.cargarAutos();
  }

  cargarAutos(): void {
    this.isLoading.set(true);
    
    this.adminAutoService.listarAutosBase().subscribe({
      next: (autos: AutoBase[]) => {
        this.autos.set(autos);
        this.aplicarFiltros();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar autos:', error);
        this.isLoading.set(false);
        alert('Error al cargar los autos. Por favor, intenta nuevamente.');
      }
    });
  }

  aplicarFiltros(): void {
    let filtradas = [...this.autos()];
    const filtros = this.filtrosForm.value;

    // Filtrar por palabra clave
    if (filtros.palabraClave && filtros.palabraClave.trim() !== '') {
      const palabraClave = filtros.palabraClave.toLowerCase();
      filtradas = filtradas.filter(a => 
        a.marca.toLowerCase().includes(palabraClave) ||
        a.modelo.toLowerCase().includes(palabraClave) ||
        a.anioModelo.toString().includes(palabraClave)
      );
    }

    // Filtrar por marca
    if (filtros.marca && filtros.marca.trim() !== '') {
      const marca = filtros.marca.toLowerCase();
      filtradas = filtradas.filter(a => a.marca.toLowerCase().includes(marca));
    }

    // Filtrar por modelo
    if (filtros.modelo && filtros.modelo.trim() !== '') {
      const modelo = filtros.modelo.toLowerCase();
      filtradas = filtradas.filter(a => a.modelo.toLowerCase().includes(modelo));
    }

    // Ordenar
    if (filtros.sortBy) {
      filtradas.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (filtros.sortBy) {
          case 'marca':
            aValue = a.marca.toLowerCase();
            bValue = b.marca.toLowerCase();
            break;
          case 'modelo':
            aValue = a.modelo.toLowerCase();
            bValue = b.modelo.toLowerCase();
            break;
          case 'anioModelo':
            aValue = a.anioModelo;
            bValue = b.anioModelo;
            break;
          default:
            aValue = a.marca.toLowerCase();
            bValue = b.marca.toLowerCase();
        }

        if (filtros.sortOrder === 'DESC') {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        } else {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        }
      });
    }

    this.autosFiltrados.set(filtradas);
    this.totalElements.set(filtradas.length);
    this.totalPages.set(Math.ceil(filtradas.length / this.pageSize()));
    this.aplicarPaginacion();
  }

  aplicarPaginacion(): void {
    const inicio = this.currentPage() * this.pageSize();
    const fin = inicio + this.pageSize();
    const paginadas = this.autosFiltrados().slice(inicio, fin);
    this.autosPaginados.set(paginadas);
  }

  buscar(): void {
    this.currentPage.set(0);
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset({
      palabraClave: '',
      marca: '',
      modelo: '',
      sortBy: 'marca',
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
    this.autoForm.reset({
      marca: '',
      modelo: '',
      anioModelo: new Date().getFullYear()
    });
    this.mostrarModalCrear.set(true);
  }

  crearAuto(): void {
    if (this.autoForm.valid) {
      this.isLoading.set(true);
      const autoData: AutoBaseCreate = this.autoForm.value;
      
      this.adminAutoService.crearAutoBase(autoData).subscribe({
        next: () => {
          alert('Auto creado exitosamente');
          this.mostrarModalCrear.set(false);
          this.cargarAutos();
        },
        error: (error) => {
          console.error('Error al crear auto:', error);
          let mensaje = 'Error al crear el auto. Por favor, intenta nuevamente.';
          if (error.error?.message) {
            mensaje = error.error.message;
          }
          alert(mensaje);
          this.isLoading.set(false);
        }
      });
    }
  }

  confirmarEliminar(auto: AutoBase): void {
    this.autoSeleccionado.set(auto);
    this.mostrarModalEliminar.set(true);
  }

  eliminarAuto(): void {
    const auto = this.autoSeleccionado();
    if (!auto) return;

    this.isLoading.set(true);
    this.adminAutoService.eliminarAutoBase(auto.id).subscribe({
      next: () => {
        alert('Auto eliminado exitosamente');
        this.mostrarModalEliminar.set(false);
        this.autoSeleccionado.set(null);
        this.cargarAutos();
      },
      error: (error) => {
        console.error('Error al eliminar auto:', error);
        let mensaje = 'Error al eliminar el auto. Por favor, intenta nuevamente.';
        if (error.error?.message) {
          mensaje = error.error.message;
        }
        alert(mensaje);
        this.isLoading.set(false);
      }
    });
  }

  cerrarModales(): void {
    this.mostrarModalCrear.set(false);
    this.mostrarModalEliminar.set(false);
    this.autoSeleccionado.set(null);
  }

  formatearFecha(fecha?: string): string {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getAnioMaximo(): number {
    return new Date().getFullYear() + 1;
  }

  getFieldError(fieldName: string): string {
    const field = this.autoForm.get(fieldName);
    
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return 'Este campo es requerido';
      }
      if (field.errors['maxlength']) {
        return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      }
      if (field.errors['min']) {
        return `El valor mínimo es ${field.errors['min'].min}`;
      }
    }
    
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.autoForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }
}

