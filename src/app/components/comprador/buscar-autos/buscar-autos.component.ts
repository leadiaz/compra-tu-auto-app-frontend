import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AutoService } from '../../../services/auto.service';
import { FavoritoService } from '../../../services/favorito.service';
import { Auto, FiltrosBusqueda, BusquedaResponse, TipoCombustible, TipoTransmision } from '../../../models/auto.model';

@Component({
  selector: 'app-buscar-autos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './buscar-autos.component.html',
  styleUrl: './buscar-autos.component.css'
})
export class BuscarAutosComponent implements OnInit {
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
  favoritosIds = signal<Set<number>>(new Set());

  constructor(
    private fb: FormBuilder,
    private autoService: AutoService,
    private favoritoService: FavoritoService,
    private router: Router
  ) {
    this.filtrosForm = this.fb.group({
      palabraClave: [''],
      precioMin: [null],
      precioMax: [null],
      marca: [''],
      modelo: [''],
      añoMin: [null],
      añoMax: [null],
      kilometrajeMin: [null],
      kilometrajeMax: [null],
      combustible: [''],
      transmision: [''],
      concesionariaId: [null],
      sortBy: ['precio'],
      sortOrder: ['ASC']
    });
  }

  ngOnInit(): void {
    this.cargarMarcas();
    this.cargarFavoritos();
    this.buscar();
    
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

  cargarFavoritos(): void {
    this.favoritoService.listarFavoritos().subscribe({
      next: (favoritos) => {
        const ids = new Set(favoritos.map(f => f.autoId));
        this.favoritosIds.set(ids);
      },
      error: (error) => console.error('Error al cargar favoritos:', error)
    });
  }

  buscar(): void {
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

    this.autoService.buscarAutos(filtros).subscribe({
      next: (response: BusquedaResponse) => {
        this.autos.set(response.content);
        this.totalElements.set(response.totalElements);
        this.totalPages.set(response.totalPages);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al buscar autos:', error);
        this.isLoading.set(false);
      }
    });
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset({
      sortBy: 'precio',
      sortOrder: 'ASC'
    });
    this.currentPage.set(0);
    this.buscar();
  }

  cambiarPagina(page: number): void {
    this.currentPage.set(page);
    this.buscar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleFavorito(auto: Auto): void {
    const esFavorito = this.favoritosIds().has(auto.id);
    
    if (esFavorito) {
      this.favoritoService.eliminarFavorito(auto.id).subscribe({
        next: () => {
          const nuevosIds = new Set(this.favoritosIds());
          nuevosIds.delete(auto.id);
          this.favoritosIds.set(nuevosIds);
        },
        error: (error) => console.error('Error al eliminar favorito:', error)
      });
    } else {
      this.favoritoService.agregarFavorito({ autoId: auto.id }).subscribe({
        next: () => {
          const nuevosIds = new Set(this.favoritosIds());
          nuevosIds.add(auto.id);
          this.favoritosIds.set(nuevosIds);
        },
        error: (error) => console.error('Error al agregar favorito:', error)
      });
    }
  }

  esFavorito(autoId: number): boolean {
    return this.favoritosIds().has(autoId);
  }

  verDetalle(autoId: number): void {
    this.router.navigate(['/dashboard/autos', autoId]);
  }

  toggleFiltros(): void {
    this.mostrarFiltros.update(val => !val);
  }
}

