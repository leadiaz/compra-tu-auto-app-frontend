export interface ConcesionariaAdmin {
  id: number;
  nombre: string;
  cuit: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  fechaAlta: string;
  fechaActualizacion?: string;
  activa: boolean;
  usuarioNombre?: string;
  cantidadUsuarios?: number;
  cantidadAutos?: number;
  cantidadVentas?: number;
}

export interface ConcesionariaAdminCreate {
  nombre: string;
  cuit: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  usuarioId?: number;
}

export interface ConcesionariaAdminUpdate {
  nombre?: string;
  cuit?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  usuarioId?: number;
}

export interface ConcesionariaAdminFiltros {
  activa?: boolean;
  palabraClave?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface ConcesionariaAdminResponse {
  content: ConcesionariaAdmin[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

