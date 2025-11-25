export interface Compra {
  id: number;
  autoId: number;
  usuarioId: number;
  precio: number; // Precio del momento de la compra
  fechaCompra: string;
  concesionariaId: number;
  concesionariaNombre?: string;
  auto?: any; // Referencia al auto completo
}

export interface CompraRequest {
  autoId: number;
  precio: number;
}

export interface CompraFiltros {
  fechaDesde?: string;
  fechaHasta?: string;
  concesionariaId?: number;
  marca?: string;
  precioMin?: number;
  precioMax?: number;
}

