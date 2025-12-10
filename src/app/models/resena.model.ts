export interface Resena {
  id: number;
  autoId: number;
  autoMarca: string;
  autoModelo: string;
  autoAnioModelo: number;
  usuarioId: number;
  usuarioNombre: string;
  usuarioApellido: string;
  puntaje: number; // 0 a 10
  comentario?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface ResenaRequest {
  autoId: number;
  puntaje: number;
  comentario?: string;
}

export interface ResenaUpdate {
  puntaje: number;
  comentario?: string;
}

export interface TopAutoRankeado {
  autoId: number;
  marca: string;
  modelo: string;
  anioModelo: number;
  promedioPuntaje: number;
  cantidadResenas: number;
}

