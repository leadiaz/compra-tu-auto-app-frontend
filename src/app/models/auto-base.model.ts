/**
 * Modelo para la gestión de autos base (marca, modelo, año)
 * Usado en los endpoints de administración de autos
 */
export interface AutoBase {
  id: number;
  marca: string;
  modelo: string;
  anioModelo: number;
  fechaAlta: string;
  fechaActualizacion: string;
}

export interface AutoBaseCreate {
  marca: string;
  modelo: string;
  anioModelo: number;
}

