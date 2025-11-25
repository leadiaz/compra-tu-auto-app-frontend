export interface LoginRequest {
  usuario: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  usuario?: User;
  [key: string]: any;
}
export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  fechaAlta: string;
  activo: boolean;
  tipoUsuario: TipoUsuario;
}

export enum TipoUsuario {
  ADMIN = 'ADMIN',
  COMPRADOR = 'COMPRADOR',
  CONCESIONARIO = 'CONCESIONARIA',
}
