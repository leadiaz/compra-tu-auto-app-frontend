import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { VentaService } from '../../../services/venta.service';
import { Venta, VentaFiltros, VentaResponse } from '../../../models/venta.model';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.css'
})
export class VentasComponent implements OnInit {
  filtrosForm: FormGroup;
  ventas = signal<Venta[]>([]);
  isLoading = signal(false);
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(0);
  pageSize = signal(10);
  
  mostrarFiltros = signal(false);
  ventaSeleccionada = signal<Venta | null>(null);
  mostrarModalDetalle = signal(false);

  constructor(
    private fb: FormBuilder,
    private ventaService: VentaService,
    private router: Router
  ) {
    this.filtrosForm = this.fb.group({
      fechaDesde: [''],
      fechaHasta: [''],
      precioMin: [null],
      precioMax: [null],
      sortBy: ['fechaVenta'],
      sortOrder: ['DESC']
    });
  }

  ngOnInit(): void {
    this.cargarVentas();
  }

  cargarVentas(): void {
    this.isLoading.set(true);
    const filtros: VentaFiltros = {
      ...this.filtrosForm.value,
      page: this.currentPage(),
      size: this.pageSize()
    };

    // Limpiar valores vacíos
    Object.keys(filtros).forEach(key => {
      if (filtros[key as keyof VentaFiltros] === '' || filtros[key as keyof VentaFiltros] === null) {
        delete filtros[key as keyof VentaFiltros];
      }
    });

    this.ventaService.listarVentas(filtros).subscribe({
      next: (response: VentaResponse) => {
        this.ventas.set(response.content);
        this.totalElements.set(response.totalElements);
        this.totalPages.set(response.totalPages);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar ventas:', error);
        this.isLoading.set(false);
        alert('Error al cargar las ventas. Por favor, intenta nuevamente.');
      }
    });
  }

  buscar(): void {
    this.currentPage.set(0);
    this.cargarVentas();
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset({
      fechaDesde: '',
      fechaHasta: '',
      precioMin: null,
      precioMax: null,
      sortBy: 'fechaVenta',
      sortOrder: 'DESC'
    });
    this.buscar();
  }

  toggleFiltros(): void {
    this.mostrarFiltros.update(val => !val);
  }

  irAPagina(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
      this.cargarVentas();
    }
  }

  verDetalle(venta: Venta): void {
    this.ventaSeleccionada.set(venta);
    this.mostrarModalDetalle.set(true);
  }

  cerrarModal(): void {
    this.mostrarModalDetalle.set(false);
    this.ventaSeleccionada.set(null);
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(precio);
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  exportarVentas(formato: 'excel' | 'pdf'): void {
    const filtros: VentaFiltros = this.filtrosForm.value;
    
    // Limpiar valores vacíos
    Object.keys(filtros).forEach(key => {
      if (filtros[key as keyof VentaFiltros] === '' || filtros[key as keyof VentaFiltros] === null) {
        delete filtros[key as keyof VentaFiltros];
      }
    });

    this.isLoading.set(true);
    this.ventaService.exportarVentas(formato, filtros).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ventas.${formato === 'excel' ? 'xlsx' : 'pdf'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.isLoading.set(false);
        alert(`Ventas exportadas exitosamente en formato ${formato.toUpperCase()}`);
      },
      error: (error) => {
        console.error('Error al exportar ventas:', error);
        alert('Error al exportar las ventas. Por favor, intenta nuevamente.');
        this.isLoading.set(false);
      }
    });
  }
}



