import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FavoritoService } from '../../../services/favorito.service';
import { ResenaService } from '../../../services/resena.service';
import { Favorito } from '../../../models/favorito.model';
import { Resena } from '../../../models/resena.model';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './favoritos.component.html',
  styleUrl: './favoritos.component.css'
})
export class FavoritosComponent implements OnInit {
  favoritos = signal<Favorito[]>([]);
  reseñas = signal<Map<number, Resena>>(new Map());
  isLoading = signal(true);

  constructor(
    private favoritoService: FavoritoService,
    private resenaService: ResenaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarFavoritos();
  }

  cargarFavoritos(): void {
    this.isLoading.set(true);
    this.favoritoService.listarFavoritos().subscribe({
      next: (favoritos) => {
        this.favoritos.set(favoritos);
        this.cargarResenas(favoritos);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar favoritos:', error);
        this.isLoading.set(false);
      }
    });
  }

  cargarResenas(favoritos: Favorito[]): void {
    const reseñasMap = new Map<number, Resena>();
    
    favoritos.forEach(favorito => {
      this.resenaService.obtenerResena(favorito.autoId).subscribe({
        next: (resena) => {
          if (resena) {
            reseñasMap.set(favorito.autoId, resena);
            this.reseñas.set(new Map(reseñasMap));
          }
        },
        error: () => {
          // No hay reseña para este auto, continuar
        }
      });
    });
  }

  eliminarFavorito(favorito: Favorito): void {
    if (confirm('¿Estás seguro de quitar este auto de favoritos?')) {
      this.favoritoService.eliminarFavorito(favorito.autoId).subscribe({
        next: () => {
          this.favoritos.update(favs => favs.filter(f => f.id !== favorito.id));
        },
        error: (error) => {
          console.error('Error al eliminar favorito:', error);
          alert('Error al eliminar favorito. Por favor, intenta nuevamente.');
        }
      });
    }
  }

  verDetalle(autoId: number): void {
    this.router.navigate(['/dashboard/autos', autoId]);
  }

  tieneResena(autoId: number): boolean {
    return this.reseñas().has(autoId);
  }

  obtenerResena(autoId: number): Resena | undefined {
    return this.reseñas().get(autoId);
  }
}

