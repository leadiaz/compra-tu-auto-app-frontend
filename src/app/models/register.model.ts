import { TipoUsuario } from './auth.model';

export interface RegisterRequest {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  tipoUsuario: TipoUsuario;
}

export interface RegisterResponse {
  id?: number;
  email?: string;
  nombre?: string;
  apellido?: string;
  tipoUsuario?: TipoUsuario;
  [key: string]: any;
}

