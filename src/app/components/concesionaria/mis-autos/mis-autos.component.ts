import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ConcesionariaAutoService } from '../../../services/concesionaria-auto.service';
import { AutoService } from '../../../services/auto.service';
import { Auto, FiltrosBusqueda, BusquedaResponse, TipoCombustible, TipoTransmision } from '../../../models/auto.model';

@Component({
  selector: 'app-mis-autos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './mis-autos.component.html',
  styleUrl: './mis-autos.component.css'
})
export class MisAutosComponent implements OnInit {
  filtrosForm: FormGroup;
  autos = signal<Auto[]>([]);
  isLoading = signal(false);
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(0);
  pageSize = signal(12);
  
  marcas = signal<string[]>([]);
  modelos = signal<string[]>([]);
  tiposCombustible = Object.values(TipoCombustible);
  tiposTransmision = Object.values(TipoTransmision);
  
  mostrarFiltros = signal(false);
  autoSeleccionado = signal<Auto | null>(null);
  mostrarModalEliminar = signal(false);
  mostrarModalActivar = signal(false);
  mostrarModalDesactivar = signal(false);

  constructor(
    private fb: FormBuilder,
    private concesionariaAutoService: ConcesionariaAutoService,
    private autoService: AutoService,
    private router: Router
  ) {
    this.filtrosForm = this.fb.group({
      marca: [''],
      modelo: [''],
      precioMin: [null],
      precioMax: [null],
      activo: [null], // null = todos, true = activos, false = inactivos
      sortBy: ['fechaPublicacion'],
      sortOrder: ['DESC']
    });
  }

  ngOnInit(): void {
    this.cargarMarcas();
    this.cargarAutos();
    
    // Cargar modelos cuando cambie la marca
    this.filtrosForm.get('marca')?.valueChanges.subscribe(marca => {
      if (marca) {
        this.cargarModelos(marca);
      } else {
        this.modelos.set([]);
      }
    });
  }

  cargarMarcas(): void {
    this.autoService.obtenerMarcas().subscribe({
      next: (marcas) => this.marcas.set(marcas),
      error: (error) => console.error('Error al cargar marcas:', error)
    });
  }

  cargarModelos(marca: string): void {
    this.autoService.obtenerModelosPorMarca(marca).subscribe({
      next: (modelos) => this.modelos.set(modelos),
      error: (error) => console.error('Error al cargar modelos:', error)
    });
  }

  cargarAutos(): void {
    this.isLoading.set(true);
    const filtros: FiltrosBusqueda = {
      ...this.filtrosForm.value,
      page: this.currentPage(),
      size: this.pageSize()
    };

    this.concesionariaAutoService.listarMisAutos(
      this.currentPage(),
      this.pageSize(),
      filtros
    ).subscribe({
      next: (response: BusquedaResponse) => {
        this.autos.set(response.content);
        this.totalElements.set(response.totalElements);
        this.totalPages.set(response.totalPages);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar autos:', error);
        this.isLoading.set(false);
        alert('Error al cargar los autos. Por favor, intenta nuevamente.');
      }
    });
  }

  buscar(): void {
    this.currentPage.set(0);
    this.cargarAutos();
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset({
      marca: '',
      modelo: '',
      precioMin: null,
      precioMax: null,
      activo: null,
      sortBy: 'fechaPublicacion',
      sortOrder: 'DESC'
    });
    this.modelos.set([]);
    this.buscar();
  }

  toggleFiltros(): void {
    this.mostrarFiltros.update(val => !val);
  }

  irAPagina(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
      this.cargarAutos();
    }
  }

  editarAuto(auto: Auto): void {
    this.router.navigate(['/dashboard/editar-auto', auto.id]);
  }

  verDetalle(auto: Auto): void {
    this.router.navigate(['/dashboard/autos', auto.id]);
  }

  confirmarEliminar(auto: Auto): void {
    this.autoSeleccionado.set(auto);
    this.mostrarModalEliminar.set(true);
  }

  eliminarAuto(): void {
    const auto = this.autoSeleccionado();
    if (!auto) return;

    this.isLoading.set(true);
    this.concesionariaAutoService.eliminarAuto(auto.id).subscribe({
      next: () => {
        alert('Auto eliminado exitosamente');
        this.mostrarModalEliminar.set(false);
        this.autoSeleccionado.set(null);
        this.cargarAutos();
      },
      error: (error) => {
        console.error('Error al eliminar auto:', error);
        alert('Error al eliminar el auto. Por favor, intenta nuevamente.');
        this.isLoading.set(false);
      }
    });
  }

  confirmarActivar(auto: Auto): void {
    this.autoSeleccionado.set(auto);
    this.mostrarModalActivar.set(true);
  }

  activarAuto(): void {
    const auto = this.autoSeleccionado();
    if (!auto) return;

    this.isLoading.set(true);
    this.concesionariaAutoService.activarAuto(auto.id).subscribe({
      next: () => {
        alert('Auto activado exitosamente');
        this.mostrarModalActivar.set(false);
        this.autoSeleccionado.set(null);
        this.cargarAutos();
      },
      error: (error) => {
        console.error('Error al activar auto:', error);
        alert('Error al activar el auto. Por favor, intenta nuevamente.');
        this.isLoading.set(false);
      }
    });
  }

  confirmarDesactivar(auto: Auto): void {
    this.autoSeleccionado.set(auto);
    this.mostrarModalDesactivar.set(true);
  }

  desactivarAuto(): void {
    const auto = this.autoSeleccionado();
    if (!auto) return;

    this.isLoading.set(true);
    this.concesionariaAutoService.desactivarAuto(auto.id).subscribe({
      next: () => {
        alert('Auto desactivado exitosamente');
        this.mostrarModalDesactivar.set(false);
        this.autoSeleccionado.set(null);
        this.cargarAutos();
      },
      error: (error) => {
        console.error('Error al desactivar auto:', error);
        alert('Error al desactivar el auto. Por favor, intenta nuevamente.');
        this.isLoading.set(false);
      }
    });
  }

  duplicarAuto(auto: Auto): void {
    if (!confirm(`¿Deseas duplicar el auto ${auto.marca} ${auto.modelo}?`)) {
      return;
    }

    this.isLoading.set(true);
    this.concesionariaAutoService.duplicarAuto(auto.id).subscribe({
      next: (nuevoAuto) => {
        alert('Auto duplicado exitosamente');
        this.cargarAutos();
      },
      error: (error) => {
        console.error('Error al duplicar auto:', error);
        alert('Error al duplicar el auto. Por favor, intenta nuevamente.');
        this.isLoading.set(false);
      }
    });
  }

  cerrarModales(): void {
    this.mostrarModalEliminar.set(false);
    this.mostrarModalActivar.set(false);
    this.mostrarModalDesactivar.set(false);
    this.autoSeleccionado.set(null);
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(precio);
  }
}



