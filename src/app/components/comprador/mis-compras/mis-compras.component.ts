import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CompraService } from '../../../services/compra.service';
import { Compra, CompraFiltros } from '../../../models/compra.model';

@Component({
  selector: 'app-mis-compras',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './mis-compras.component.html',
  styleUrl: './mis-compras.component.css'
})
export class MisComprasComponent implements OnInit {
  compras = signal<Compra[]>([]);
  isLoading = signal(true);
  mostrarFiltros = signal(false);
  
  filtros: CompraFiltros = {
    fechaDesde: '',
    fechaHasta: '',
    concesionariaId: undefined,
    marca: '',
    precioMin: undefined,
    precioMax: undefined
  };

  constructor(
    private compraService: CompraService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarCompras();
  }

  cargarCompras(): void {
    this.isLoading.set(true);
    const filtros = Object.keys(this.filtros).some(key => {
      const value = this.filtros[key as keyof CompraFiltros];
      return value !== '' && value !== undefined && value !== null;
    }) ? this.filtros : undefined;

    this.compraService.obtenerHistorialCompras(filtros).subscribe({
      next: (compras) => {
        this.compras.set(compras);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar compras:', error);
        this.isLoading.set(false);
      }
    });
  }

  toggleFiltros(): void {
    this.mostrarFiltros.update(val => !val);
  }

  aplicarFiltros(): void {
    this.cargarCompras();
    this.mostrarFiltros.set(false);
  }

  limpiarFiltros(): void {
    this.filtros = {
      fechaDesde: '',
      fechaHasta: '',
      concesionariaId: undefined,
      marca: '',
      precioMin: undefined,
      precioMax: undefined
    };
    this.cargarCompras();
  }

  verDetalle(compraId: number): void {
    this.router.navigate(['/dashboard/compras', compraId]);
  }

  verDetalleAuto(autoId: number): void {
    this.router.navigate(['/dashboard/autos', autoId]);
  }
}

