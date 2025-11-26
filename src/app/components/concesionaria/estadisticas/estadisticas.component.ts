import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VentaService } from '../../../services/venta.service';
import { EstadisticasVentas } from '../../../models/venta.model';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estadisticas.component.html',
  styleUrl: './estadisticas.component.css'
})
export class EstadisticasComponent implements OnInit {
  estadisticas = signal<EstadisticasVentas | null>(null);
  isLoading = signal(true);

  constructor(private ventaService: VentaService) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  cargarEstadisticas(): void {
    this.isLoading.set(true);
    this.ventaService.obtenerEstadisticas().subscribe({
      next: (estadisticas) => {
        this.estadisticas.set(estadisticas);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
        this.isLoading.set(false);
        alert('Error al cargar las estadísticas. Por favor, intenta nuevamente.');
      }
    });
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(precio);
  }
}



