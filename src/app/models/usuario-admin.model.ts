export interface UsuarioAdmin {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  fechaAlta: string;
  activo: boolean;
  tipoUsuario: string;
  concesionariaId?: number;
  concesionariaNombre?: string;
}

export interface UsuarioAdminCreate {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  tipoUsuario: string;
  concesionariaId?: number;
}

export interface UsuarioAdminUpdate {
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  tipoUsuario?: string;
  concesionariaId?: number;
}

export interface UsuarioAdminFiltros {
  tipoUsuario?: string;
  activo?: boolean;
  concesionariaId?: number;
  fechaAltaDesde?: string;
  fechaAltaHasta?: string;
  palabraClave?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface UsuarioAdminResponse {
  content: UsuarioAdmin[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

