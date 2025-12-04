import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminCompraService, CompraAdminFiltros, CompraAdminResponse } from '../../../services/admin-compra.service';
import { Compra } from '../../../models/compra.model';

@Component({
  selector: 'app-compras-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './compras.component.html',
  styleUrl: './compras.component.css'
})
export class ComprasComponent implements OnInit {
  filtrosForm: FormGroup;
  compras = signal<Compra[]>([]);
  isLoading = signal(false);
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(0);
  pageSize = signal(10);
  
  mostrarFiltros = signal(false);
  compraSeleccionada = signal<Compra | null>(null);
  mostrarModalDetalle = signal(false);

  constructor(
    private fb: FormBuilder,
    private adminCompraService: AdminCompraService,
    private router: Router
  ) {
    this.filtrosForm = this.fb.group({
      fechaDesde: [''],
      fechaHasta: [''],
      compradorId: [null],
      concesionariaId: [null],
      precioMin: [null],
      precioMax: [null],
      marca: [''],
      sortBy: ['fechaCompra'],
      sortOrder: ['DESC']
    });
  }

  ngOnInit(): void {
    this.cargarCompras();
  }

  cargarCompras(): void {
    this.isLoading.set(true);
    const filtros: CompraAdminFiltros = {
      ...this.filtrosForm.value,
      page: this.currentPage(),
      size: this.pageSize()
    };

    // Limpiar valores vacíos
    Object.keys(filtros).forEach(key => {
      if (filtros[key as keyof CompraAdminFiltros] === '' || filtros[key as keyof CompraAdminFiltros] === null) {
        delete filtros[key as keyof CompraAdminFiltros];
      }
    });

    this.adminCompraService.consultarCompras(filtros).subscribe({
      next: (response: CompraAdminResponse) => {
        this.compras.set(response.content);
        this.totalElements.set(response.totalElements);
        this.totalPages.set(response.totalPages);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar compras:', error);
        this.isLoading.set(false);
        alert('Error al cargar las compras. Por favor, intenta nuevamente.');
      }
    });
  }

  buscar(): void {
    this.currentPage.set(0);
    this.cargarCompras();
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset({
      fechaDesde: '',
      fechaHasta: '',
      compradorId: null,
      concesionariaId: null,
      precioMin: null,
      precioMax: null,
      marca: '',
      sortBy: 'fechaCompra',
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
      this.cargarCompras();
    }
  }

  verDetalle(compra: Compra): void {
    this.compraSeleccionada.set(compra);
    this.mostrarModalDetalle.set(true);
  }

  cerrarModal(): void {
    this.mostrarModalDetalle.set(false);
    this.compraSeleccionada.set(null);
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

  exportarCompras(formato: 'excel' | 'pdf'): void {
    const filtros: CompraAdminFiltros = this.filtrosForm.value;
    
    // Limpiar valores vacíos
    Object.keys(filtros).forEach(key => {
      if (filtros[key as keyof CompraAdminFiltros] === '' || filtros[key as keyof CompraAdminFiltros] === null) {
        delete filtros[key as keyof CompraAdminFiltros];
      }
    });

    this.isLoading.set(true);
    this.adminCompraService.exportarCompras(formato, filtros).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compras.${formato === 'excel' ? 'xlsx' : 'pdf'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.isLoading.set(false);
        alert(`Compras exportadas exitosamente en formato ${formato.toUpperCase()}`);
      },
      error: (error) => {
        console.error('Error al exportar compras:', error);
        alert('Error al exportar las compras. Por favor, intenta nuevamente.');
        this.isLoading.set(false);
      }
    });
  }
}

