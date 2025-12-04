export interface Venta {
  id: number;
  autoId: number;
  compradorId: number;
  concesionariaId: number;
  precio: number; // Precio del momento de la venta
  fechaVenta: string;
  estado?: string;
  auto?: any; // Referencia al auto completo
  comprador?: any; // Referencia al comprador completo
  concesionariaNombre?: string;
}

export interface VentaFiltros {
  fechaDesde?: string;
  fechaHasta?: string;
  compradorId?: number;
  autoId?: number;
  precioMin?: number;
  precioMax?: number;
  estado?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface VentaResponse {
  content: Venta[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface EstadisticasVentas {
  totalVentas: number;
  totalIngresos: number;
  promedioVenta: number;
  ventasPorMes?: { mes: string; cantidad: number; ingresos: number }[];
  autosMasVendidos?: { autoId: number; marca: string; modelo: string; cantidad: number }[];
}



