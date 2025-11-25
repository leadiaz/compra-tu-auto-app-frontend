export interface Auto {
  id: number;
  marca: string;
  modelo: string;
  año: number;
  precio: number;
  kilometraje: number;
  combustible: TipoCombustible;
  transmision: TipoTransmision;
  color: string;
  descripcion: string;
  concesionariaId: number;
  concesionariaNombre?: string;
  imagenes?: string[];
  fechaPublicacion?: string;
  activo?: boolean;
}

export enum TipoCombustible {
  NAFTA = 'NAFTA',
  DIESEL = 'DIESEL',
  ELECTRICO = 'ELECTRICO',
  HIBRIDO = 'HIBRIDO',
  GNC = 'GNC'
}

export enum TipoTransmision {
  MANUAL = 'MANUAL',
  AUTOMATICA = 'AUTOMATICA'
}

export interface FiltrosBusqueda {
  palabraClave?: string;
  precioMin?: number;
  precioMax?: number;
  marca?: string;
  modelo?: string;
  añoMin?: number;
  añoMax?: number;
  kilometrajeMin?: number;
  kilometrajeMax?: number;
  combustible?: TipoCombustible;
  transmision?: TipoTransmision;
  concesionariaId?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface BusquedaResponse {
  content: Auto[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

