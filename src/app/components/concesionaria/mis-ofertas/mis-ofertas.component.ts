import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ConcesionariaOfertaService } from '../../../services/concesionaria-oferta.service';
import { Oferta, OfertaFiltros } from '../../../models/oferta.model';

@Component({
  selector: 'app-mis-ofertas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './mis-ofertas.component.html',
  styleUrl: './mis-ofertas.component.css'
})
export class MisOfertasComponent implements OnInit {
  filtrosForm: FormGroup;
  ofertas = signal<Oferta[]>([]);
  isLoading = signal(false);
  
  mostrarFiltros = signal(false);
  ofertaSeleccionada = signal<Oferta | null>(null);
  mostrarModalEliminar = signal(false);

  constructor(
    private fb: FormBuilder,
    private concesionariaOfertaService: ConcesionariaOfertaService,
    private router: Router
  ) {
    this.filtrosForm = this.fb.group({
      autoId: [null],
      precioMin: [null],
      precioMax: [null],
      moneda: [''],
      stockMin: [null]
    });
  }

  ngOnInit(): void {
    this.cargarOfertas();
  }

  cargarOfertas(): void {
    this.isLoading.set(true);
    const filtros: OfertaFiltros = this.filtrosForm.value;

    // Limpiar valores vacíos
    Object.keys(filtros).forEach(key => {
      if (filtros[key as keyof OfertaFiltros] === '' || filtros[key as keyof OfertaFiltros] === null) {
        delete filtros[key as keyof OfertaFiltros];
      }
    });

    this.concesionariaOfertaService.listarMisOfertas(filtros).subscribe({
      next: (ofertas) => {
        this.ofertas.set(ofertas);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar ofertas:', error);
        alert('Error al cargar las ofertas. Por favor, intenta nuevamente.');
        this.isLoading.set(false);
      }
    });
  }

  buscar(): void {
    this.cargarOfertas();
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset({
      autoId: null,
      precioMin: null,
      precioMax: null,
      moneda: '',
      stockMin: null
    });
    this.buscar();
  }

  toggleFiltros(): void {
    this.mostrarFiltros.update(val => !val);
  }

  confirmarEliminar(oferta: Oferta): void {
    this.ofertaSeleccionada.set(oferta);
    this.mostrarModalEliminar.set(true);
  }

  eliminarOferta(): void {
    const oferta = this.ofertaSeleccionada();
    if (!oferta) return;

    this.isLoading.set(true);
    this.concesionariaOfertaService.eliminarOferta(oferta.id).subscribe({
      next: () => {
        alert('Oferta eliminada exitosamente');
        this.mostrarModalEliminar.set(false);
        this.ofertaSeleccionada.set(null);
        this.cargarOfertas();
      },
      error: (error) => {
        console.error('Error al eliminar oferta:', error);
        alert(error.error?.message || 'Error al eliminar la oferta. Por favor, intenta nuevamente.');
        this.isLoading.set(false);
      }
    });
  }

  cerrarModales(): void {
    this.mostrarModalEliminar.set(false);
    this.ofertaSeleccionada.set(null);
  }

  verDetalleAuto(autoId: number): void {
    this.router.navigate(['/dashboard/mis-autos']);
  }

  formatearFecha(fecha?: string): string {
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
}

