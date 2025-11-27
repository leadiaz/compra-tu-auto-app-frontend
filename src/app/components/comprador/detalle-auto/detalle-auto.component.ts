import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AutoService } from '../../../services/auto.service';
import { FavoritoService } from '../../../services/favorito.service';
import { ResenaService } from '../../../services/resena.service';
import { CompraService } from '../../../services/compra.service';
import { Auto } from '../../../models/auto.model';
import { Resena, ResenaRequest, ResenaUpdate } from '../../../models/resena.model';
import { CompraRequest } from '../../../models/compra.model';

@Component({
  selector: 'app-detalle-auto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './detalle-auto.component.html',
  styleUrl: './detalle-auto.component.css'
})
export class DetalleAutoComponent implements OnInit {
  auto = signal<Auto | null>(null);
  isLoading = signal(true);
  esFavorito = signal(false);
  resena = signal<Resena | null>(null);
  mostrarFormResena = signal(false);
  mostrarFormCompra = signal(false);
  
  resenaForm = {
    puntaje: 5,
    comentario: ''
  };
  
  compraForm = {
    precio: 0
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private autoService: AutoService,
    private favoritoService: FavoritoService,
    private resenaService: ResenaService,
    private compraService: CompraService
  ) {}

  ngOnInit(): void {
    const autoId = this.route.snapshot.paramMap.get('id');
    if (autoId) {
      this.cargarAuto(+autoId);
      this.verificarFavorito(+autoId);
      this.cargarResena(+autoId);
    }
  }

  cargarAuto(id: number): void {
    this.isLoading.set(true);
    this.autoService.obtenerDetalleAuto(id).subscribe({
      next: (auto) => {
        this.auto.set(auto);
        this.compraForm.precio = auto.precio;
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar auto:', error);
        this.isLoading.set(false);
      }
    });
  }

  verificarFavorito(autoId: number): void {
    // Listar favoritos y verificar si el auto está en la lista
    this.favoritoService.listarFavoritos().subscribe({
      next: (favoritos) => {
        const esFav = favoritos.some(f => f.autoId === autoId);
        this.esFavorito.set(esFav);
      },
      error: () => this.esFavorito.set(false)
    });
  }

  cargarResena(autoId: number): void {
    // Listar reseñas del auto y buscar la del usuario actual
    this.resenaService.listarResenasPorAuto(autoId).subscribe({
      next: (resenas: Resena[]) => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            const miResena = resenas.find(r => r.usuarioId === user.id);
            if (miResena) {
              this.resena.set(miResena);
              this.resenaForm.puntaje = miResena.puntaje;
              this.resenaForm.comentario = miResena.comentario || '';
            } else {
              this.resena.set(null);
            }
          } catch {
            this.resena.set(null);
          }
        } else {
          this.resena.set(null);
        }
      },
      error: () => this.resena.set(null)
    });
  }

  toggleFavorito(): void {
    const auto = this.auto();
    if (!auto) return;

    if (this.esFavorito()) {
      // Buscar el favorito para obtener el ofertaId
      this.favoritoService.listarFavoritos().subscribe({
        next: (favoritos) => {
          const favorito = favoritos.find(f => f.autoId === auto.id);
          if (favorito) {
            this.favoritoService.eliminarFavorito(favorito.ofertaId).subscribe({
              next: () => this.esFavorito.set(false),
              error: (error) => {
                console.error('Error al eliminar favorito:', error);
                alert('Error al eliminar favorito. Por favor, intenta nuevamente.');
              }
            });
          }
        },
        error: (error) => {
          console.error('Error al listar favoritos:', error);
          alert('Error al verificar favoritos. Por favor, intenta nuevamente.');
        }
      });
    } else {
      // Asumimos que auto.id es el ofertaId en este contexto
      // Si no, necesitaríamos obtener el ofertaId de otra forma
      this.favoritoService.agregarFavorito({ ofertaId: auto.id }).subscribe({
        next: () => this.esFavorito.set(true),
        error: (error) => {
          console.error('Error al agregar favorito:', error);
          alert(error.error?.message || 'Error al agregar favorito. Por favor, intenta nuevamente.');
        }
      });
    }
  }

  guardarResena(): void {
    const auto = this.auto();
    if (!auto) return;

    const request: ResenaRequest = {
      autoId: auto.id,
      puntaje: this.resenaForm.puntaje,
      comentario: this.resenaForm.comentario
    };

    if (this.resena()) {
      // Actualizar reseña existente
      const update: ResenaUpdate = {
        puntaje: this.resenaForm.puntaje,
        comentario: this.resenaForm.comentario || undefined
      };
      this.resenaService.actualizarResena(auto.id, update).subscribe({
        next: (resena) => {
          this.resena.set(resena);
          this.mostrarFormResena.set(false);
          alert('Reseña actualizada exitosamente');
        },
        error: (error) => {
          console.error('Error al actualizar reseña:', error);
          alert(error.error?.message || 'Error al actualizar la reseña. Por favor, intenta nuevamente.');
        }
      });
    } else {
      // Crear nueva reseña
      this.resenaService.crearResena(request).subscribe({
        next: (resena) => {
          this.resena.set(resena);
          this.mostrarFormResena.set(false);
          alert('Reseña creada exitosamente');
        },
        error: (error) => {
          console.error('Error al crear reseña:', error);
          alert(error.error?.message || 'Error al crear la reseña. Por favor, intenta nuevamente.');
        }
      });
    }
  }

  eliminarResena(): void {
    const auto = this.auto();
    if (!auto) return;

    if (confirm('¿Estás seguro de eliminar tu reseña?')) {
      this.resenaService.eliminarResena(auto.id).subscribe({
        next: () => {
          this.resena.set(null);
          this.resenaForm.puntaje = 5;
          this.resenaForm.comentario = '';
        },
        error: (error) => console.error('Error al eliminar reseña:', error)
      });
    }
  }

  registrarCompra(): void {
    const auto = this.auto();
    if (!auto) return;

    const request: CompraRequest = {
      autoId: auto.id,
      precio: this.compraForm.precio
    };

    if (confirm(`¿Confirmas la compra de este auto por $${this.compraForm.precio}?`)) {
      this.compraService.registrarCompra(request).subscribe({
        next: () => {
          alert('Compra registrada exitosamente');
          this.mostrarFormCompra.set(false);
          this.router.navigate(['/dashboard/mis-compras']);
        },
        error: (error) => {
          console.error('Error al registrar compra:', error);
          alert('Error al registrar la compra. Por favor, intenta nuevamente.');
        }
      });
    }
  }

  volver(): void {
    this.router.navigate(['/dashboard/ofertas']);
  }
}

