export interface Favorito {
  id: number;
  autoId: number;
  usuarioId: number;
  fechaAgregado: string;
  auto?: any; // Referencia al auto completo
}

export interface FavoritoRequest {
  autoId: number;
}

