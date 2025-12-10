export interface Favorito {
  id: number;
  usuarioId: number;
  usuarioNombre: string;
  ofertaId: number;
  autoId: number;
  autoMarca: string;
  autoModelo: string;
  autoAnioModelo: number;
  concesionariaId: number;
  concesionariaNombre: string;
  precioActual: number;
  moneda: string;
  stock: number;
  fechaCreacion: string;
}

export interface FavoritoRequest {
  ofertaId: number;
}

