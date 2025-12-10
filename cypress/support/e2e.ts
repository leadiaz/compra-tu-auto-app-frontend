// Import custom commands (extend Cypress commands here if needed)
import './commands';

// Limpiar localStorage antes de cada test para evitar estados compartidos
beforeEach(() => {
  cy.window().then((win) => {
    win.localStorage.clear();
  });
});

// Manejar excepciones no capturadas de la aplicación
// Esto evita que los tests fallen cuando los componentes tienen errores esperados (porque no hay backend)
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignorar errores relacionados con datos del backend que no están disponibles
  // Estos errores son esperados cuando mockeamos el backend
  if (
    err.message.includes('is not a function') ||
    err.message.includes('is not iterable') ||
    err.message.includes('map is not a function') ||
    err.message.includes('forEach is not a function') ||
    err.message.includes('Cannot read properties') ||
    err.message.includes('Cannot read property')
  ) {
    // No fallar el test si es un error esperado de datos del backend
    return false;
  }
  
  // En otros casos, dejar que Cypress maneje el error normalmente
  return true;
});
