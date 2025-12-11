// Este archivo reemplaza api.config.ts durante el build de producción
// La URL se inyecta desde la variable de entorno API_BASE_URL durante el build
export const API_CONFIG = {
  baseUrl: 'API_BASE_URL_PLACEHOLDER'
} as const;



