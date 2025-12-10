import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminAutoService } from '../../../services/admin-auto.service';
import { AutoService } from '../../../services/auto.service';
import { Auto, FiltrosBusqueda, BusquedaResponse } from '../../../models/auto.model';

@Component({
  selector: 'app-autos-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './autos.component.html',
  styleUrl: './autos.component.css'
})
export class AutosComponent implements OnInit {
  tipoVista = signal<'favoritos' | 'comprados'>('favoritos');
  
  filtrosForm: FormGroup;
  autos = signal<Auto[]>([]);
  isLoading = signal(false);
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(0);
  pageSize = signal(12);
  
  marcas = signal<string[]>([]);
  modelos = signal<string[]>([]);
  mostrarFiltros = signal(false);
  autoSeleccionado = signal<Auto | null>(null);
  mostrarModalDetalle = signal(false);

  constructor(
    private fb: FormBuilder,
    private adminAutoService: AdminAutoService,
    private autoService: AutoService,
    private router: Router
  ) {
    this.filtrosForm = this.fb.group({
      palabraClave: [''],
      marca: [''],
      modelo: [''],
      sortBy: ['precio'],
      sortOrder: ['DESC']
    });
  }

  ngOnInit(): void {
    this.cargarMarcas();
    this.cargarAutos();
    
    this.filtrosForm.get('marca')?.valueChanges.subscribe(marca => {
      if (marca) {
        this.cargarModelos(marca);
      } else {
        this.modelos.set([]);
      }
    });
  }

  cambiarVista(tipo: 'favoritos' | 'comprados'): void {
    this.tipoVista.set(tipo);
    this.currentPage.set(0);
    this.cargarAutos();
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

    // Limpiar valores vacíos
    Object.keys(filtros).forEach(key => {
      if (filtros[key as keyof FiltrosBusqueda] === '' || filtros[key as keyof FiltrosBusqueda] === null) {
        delete filtros[key as keyof FiltrosBusqueda];
      }
    });

    const servicio = this.tipoVista() === 'favoritos' 
      ? this.adminAutoService.consultarAutosFavoritos(filtros)
      : this.adminAutoService.consultarAutosComprados(filtros);

    servicio.subscribe({
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
      palabraClave: '',
      marca: '',
      modelo: '',
      sortBy: 'precio',
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

  verDetalle(auto: Auto): void {
    this.autoSeleccionado.set(auto);
    this.mostrarModalDetalle.set(true);
  }

  cerrarModal(): void {
    this.mostrarModalDetalle.set(false);
    this.autoSeleccionado.set(null);
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(precio);
  }

  exportarAutos(formato: 'excel' | 'pdf'): void {
    const filtros: FiltrosBusqueda = this.filtrosForm.value;
    
    // Limpiar valores vacíos
    Object.keys(filtros).forEach(key => {
      if (filtros[key as keyof FiltrosBusqueda] === '' || filtros[key as keyof FiltrosBusqueda] === null) {
        delete filtros[key as keyof FiltrosBusqueda];
      }
    });

    this.isLoading.set(true);
    const servicio = this.tipoVista() === 'favoritos'
      ? this.adminAutoService.exportarAutosFavoritos(formato, filtros)
      : this.adminAutoService.exportarAutosComprados(formato, filtros);

    servicio.subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `autos-${this.tipoVista()}.${formato === 'excel' ? 'xlsx' : 'pdf'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.isLoading.set(false);
        alert(`Autos exportados exitosamente en formato ${formato.toUpperCase()}`);
      },
      error: (error) => {
        console.error('Error al exportar autos:', error);
        alert('Error al exportar los autos. Por favor, intenta nuevamente.');
        this.isLoading.set(false);
      }
    });
  }
}

