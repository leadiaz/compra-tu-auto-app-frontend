export interface Concesionaria {
  id: number;
  razonSocial: string;
  cuit?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  fechaAlta: string;
  activo: boolean;
}

export interface ConcesionariaUpdate {
  razonSocial?: string;
  cuit?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
}



