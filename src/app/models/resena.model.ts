export interface Resena {
  id: number;
  autoId: number;
  usuarioId: number;
  puntaje: number; // 0 a 10
  comentario?: string;
  fechaCreacion: string;
  fechaModificacion?: string;
  auto?: any; // Referencia al auto completo
}

export interface ResenaRequest {
  autoId: number;
  puntaje: number;
  comentario?: string;
}

export interface ResenaUpdate {
  puntaje?: number;
  comentario?: string;
}

