/**
 * Constantes de prueba para Cypress
 * 
 * NOTA: Estas contraseñas son SOLO para testing y NO deben usarse en producción.
 * Son detectadas por SonarQube como security hotspots pero están marcadas claramente
 * como constantes de prueba para evitar confusiones.
 */

// Contraseñas de prueba - SOLO PARA TESTING
export const TEST_PASSWORDS = {
  /** Contraseña de prueba con menos de 6 caracteres (para validación de longitud mínima) */
  TOO_SHORT: 'Test1',
  
  /** Contraseña de prueba válida para testing (mínimo 6 caracteres) */
  VALID: 'Test123',
  
  /** Contraseña de prueba alternativa (para verificar coincidencia) */
  MISMATCH: 'Test456',
  
  /** Contraseña de prueba para mostrar/ocultar */
  FOR_TOGGLE: 'TestPass123'
} as const;

// Emails de prueba - SOLO PARA TESTING
export const TEST_EMAILS = {
  INVALID_FORMAT: 'email-invalido',
  VALID: 'test@example.com',
  EXISTING: 'existente@example.com',
  NEW: 'nuevo@example.com'
} as const;

// Datos de usuario de prueba - SOLO PARA TESTING
export const TEST_USERS = {
  NOMBRE: 'Juan',
  APELLIDO: 'Pérez',
  NOMBRE_NUEVO: 'Nuevo',
  APELLIDO_NUEVO: 'Usuario'
} as const;

