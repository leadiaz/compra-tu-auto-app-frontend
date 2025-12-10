export interface Perfil {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  fechaAlta: string;
  activo: boolean;
  tipoUsuario: string;
}

export interface PerfilUpdate {
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
}

export interface CambioPassword {
  passwordActual: string;
  passwordNuevo: string;
  passwordNuevoConfirmacion: string;
}

