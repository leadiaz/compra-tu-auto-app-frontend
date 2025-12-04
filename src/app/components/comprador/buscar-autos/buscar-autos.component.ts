import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FavoritoService } from '../../../services/favorito.service';
import { OfertaService } from '../../../services/oferta.service';
import { Oferta, OfertaFiltros } from '../../../models/oferta.model';

@Component({
  selector: 'app-buscar-autos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './buscar-autos.component.html',
  styleUrl: './buscar-autos.component.css'
})
export class BuscarAutosComponent implements OnInit {
  filtrosForm: FormGroup;
  ofertas = signal<Oferta[]>([]);
  isLoading = signal(false);
  
  mostrarFiltros = signal(false);
  favoritosIds = signal<Set<number>>(new Set());

  constructor(
    private fb: FormBuilder,
    private ofertaService: OfertaService,
    private favoritoService: FavoritoService,
    private router: Router
  ) {
    this.filtrosForm = this.fb.group({
      precioMin: [null],
      precioMax: [null],
      moneda: ['']
    });
  }

  ngOnInit(): void {
    this.cargarFavoritos();
    this.buscar();
  }

  cargarFavoritos(): void {
    this.favoritoService.listarFavoritos().subscribe({
      next: (favoritos) => {
        const ids = new Set(favoritos.map(f => f.ofertaId));
        this.favoritosIds.set(ids);
      },
      error: (error) => console.error('Error al cargar favoritos:', error)
    });
  }

  buscar(): void {
    this.isLoading.set(true);
    const filtros: OfertaFiltros = {
      precioMin: this.filtrosForm.value.precioMin,
      precioMax: this.filtrosForm.value.precioMax,
      moneda: this.filtrosForm.value.moneda || undefined
    };

    // Limpiar valores vacíos
    Object.keys(filtros).forEach(key => {
      if (filtros[key as keyof OfertaFiltros] === '' || filtros[key as keyof OfertaFiltros] === null || filtros[key as keyof OfertaFiltros] === undefined) {
        delete filtros[key as keyof OfertaFiltros];
      }
    });

    this.ofertaService.listarOfertas(filtros).subscribe({
      next: (ofertas) => {
        this.ofertas.set(ofertas);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al buscar ofertas:', error);
        this.isLoading.set(false);
      }
    });
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset({
      precioMin: null,
      precioMax: null,
      moneda: ''
    });
    this.buscar();
  }

  toggleFavorito(oferta: Oferta): void {
    const esFavorito = this.favoritosIds().has(oferta.id);
    
    if (esFavorito) {
      this.favoritoService.eliminarFavorito(oferta.id).subscribe({
        next: () => {
          const nuevosIds = new Set(this.favoritosIds());
          nuevosIds.delete(oferta.id);
          this.favoritosIds.set(nuevosIds);
        },
        error: (error) => {
          console.error('Error al eliminar favorito:', error);
          alert('Error al eliminar favorito. Por favor, intenta nuevamente.');
        }
      });
    } else {
      this.favoritoService.agregarFavorito({ ofertaId: oferta.id }).subscribe({
        next: () => {
          const nuevosIds = new Set(this.favoritosIds());
          nuevosIds.add(oferta.id);
          this.favoritosIds.set(nuevosIds);
        },
        error: (error) => {
          console.error('Error al agregar favorito:', error);
          alert(error.error?.message || 'Error al agregar favorito. Por favor, intenta nuevamente.');
        }
      });
    }
  }

  esFavorito(ofertaId: number): boolean {
    return this.favoritosIds().has(ofertaId);
  }

  verDetalle(autoId: number): void {
    this.router.navigate(['/dashboard/autos', autoId]);
  }

  toggleFiltros(): void {
    this.mostrarFiltros.update(val => !val);
  }
}


