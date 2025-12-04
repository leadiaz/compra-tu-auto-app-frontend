import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ResenaService } from '../../../services/resena.service';
import { Resena, ResenaRequest, ResenaUpdate } from '../../../models/resena.model';

@Component({
  selector: 'app-resenas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './resenas.component.html',
  styleUrl: './resenas.component.css'
})
export class ResenasComponent implements OnInit {
  resenas = signal<Resena[]>([]);
  isLoading = signal(true);
  mostrarModalCrear = signal(false);
  mostrarModalEditar = signal(false);
  resenaSeleccionada = signal<Resena | null>(null);
  
  resenaForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private resenaService: ResenaService,
    private router: Router
  ) {
    this.resenaForm = this.fb.group({
      autoId: ['', Validators.required],
      puntaje: ['', [Validators.required, Validators.min(0), Validators.max(10)]],
      comentario: ['', Validators.maxLength(1000)]
    });
  }

  ngOnInit(): void {
    this.cargarResenas();
  }

  cargarResenas(): void {
    this.isLoading.set(true);
    this.resenaService.listarMisResenas().subscribe({
      next: (resenas) => {
        this.resenas.set(resenas);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar reseñas:', error);
        alert('Error al cargar las reseñas. Por favor, intenta nuevamente.');
        this.isLoading.set(false);
      }
    });
  }

  abrirModalCrear(): void {
    this.resenaForm.reset();
    this.resenaForm.patchValue({
      autoId: '',
      puntaje: '',
      comentario: ''
    });
    this.mostrarModalCrear.set(true);
  }

  abrirModalEditar(resena: Resena): void {
    this.resenaSeleccionada.set(resena);
    this.resenaForm.patchValue({
      autoId: resena.autoId,
      puntaje: resena.puntaje,
      comentario: resena.comentario || ''
    });
    this.mostrarModalEditar.set(true);
  }

  cerrarModales(): void {
    this.mostrarModalCrear.set(false);
    this.mostrarModalEditar.set(false);
    this.resenaSeleccionada.set(null);
    this.resenaForm.reset();
  }

  crearResena(): void {
    if (this.resenaForm.valid) {
      this.isLoading.set(true);
      const resenaData: ResenaRequest = {
        autoId: this.resenaForm.value.autoId,
        puntaje: this.resenaForm.value.puntaje,
        comentario: this.resenaForm.value.comentario || undefined
      };

      this.resenaService.crearResena(resenaData).subscribe({
        next: () => {
          alert('Reseña creada exitosamente');
          this.cerrarModales();
          this.cargarResenas();
        },
        error: (error) => {
          console.error('Error al crear reseña:', error);
          alert(error.error?.message || 'Error al crear la reseña. Por favor, intenta nuevamente.');
          this.isLoading.set(false);
        }
      });
    }
  }

  actualizarResena(): void {
    if (this.resenaForm.valid && this.resenaSeleccionada()) {
      this.isLoading.set(true);
      const resenaData: ResenaUpdate = {
        puntaje: this.resenaForm.value.puntaje,
        comentario: this.resenaForm.value.comentario || undefined
      };

      const autoId = this.resenaSeleccionada()!.autoId;
      this.resenaService.actualizarResena(autoId, resenaData).subscribe({
        next: () => {
          alert('Reseña actualizada exitosamente');
          this.cerrarModales();
          this.cargarResenas();
        },
        error: (error) => {
          console.error('Error al actualizar reseña:', error);
          alert(error.error?.message || 'Error al actualizar la reseña. Por favor, intenta nuevamente.');
          this.isLoading.set(false);
        }
      });
    }
  }

  eliminarResena(resena: Resena): void {
    if (confirm('¿Estás seguro de eliminar esta reseña?')) {
      this.isLoading.set(true);
      this.resenaService.eliminarResena(resena.autoId).subscribe({
        next: () => {
          alert('Reseña eliminada exitosamente');
          this.cargarResenas();
        },
        error: (error) => {
          console.error('Error al eliminar reseña:', error);
          alert(error.error?.message || 'Error al eliminar la reseña. Por favor, intenta nuevamente.');
          this.isLoading.set(false);
        }
      });
    }
  }

  verDetalleAuto(autoId: number): void {
    this.router.navigate(['/dashboard/autos', autoId]);
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return fecha;
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.resenaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.resenaForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) {
        return `${fieldName === 'autoId' ? 'Auto' : this.capitalizeFirst(fieldName)} es requerido`;
      }
      if (field.errors['min']) {
        return `El valor mínimo es ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `El valor máximo es ${field.errors['max'].max}`;
      }
      if (field.errors['maxlength']) {
        return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      }
    }
    return '';
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

