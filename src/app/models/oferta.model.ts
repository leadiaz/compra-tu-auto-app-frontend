export interface Oferta {
  id: number;
  autoId: number;
  concesionariaId: number;
  titulo?: string;
  descripcion?: string;
  precio?: string;
  estado?: string;
  stock: number;
  precioActual: number;
  moneda: string;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  // Información adicional que puede venir del backend
  autoMarca?: string;
  autoModelo?: string;
  autoAnioModelo?: number;
  concesionariaNombre?: string;
}

export interface OfertaCreate {
  autoId: number;
  // concesionariaId: number;
  stock: number;
  precioActual: number;
  moneda: string;
}

export interface OfertaUpdate {
  stock?: number;
  precioActual?: number;
  moneda?: string;
}

export interface OfertaFiltros {
  concesionariaId?: number;
  autoId?: number;
  precioMin?: number;
  precioMax?: number;
  moneda?: string;
  stockMin?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

