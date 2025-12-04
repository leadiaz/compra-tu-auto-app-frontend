// You can add custom Cypress commands here.
// Example: Cypress.Commands.add('login', (email: string, password: string) => { ... });

/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Simula un login sin hacer peticiones al backend
       * Configura localStorage con token y usuario mock
       * @param tipoUsuario - Tipo de usuario: 'ADMIN', 'COMPRADOR' o 'CONCESIONARIO'
       * @param email - Email opcional, si no se proporciona usa el email por defecto del tipo de usuario
       */
      loginAs(tipoUsuario: 'ADMIN' | 'COMPRADOR' | 'CONCESIONARIO', email?: string): Chainable<void>;
      
      /**
       * Limpia la sesión del usuario
       * Elimina token y usuario de localStorage
       */
      logout(): Chainable<void>;
      
      /**
       * Configura mocks para interceptar llamadas al backend
       * Intercepta todas las peticiones HTTP al API y devuelve respuestas mock
       */
      setupBackendMocks(): Chainable<void>;
    }
  }
}

// Datos mock por tipo de usuario
const mockUsers = {
  ADMIN: {
    id: 1,
    nombre: 'Admin',
    apellido: 'Test',
    email: 'admin@test.com',
    fechaAlta: '2024-01-01',
    activo: true,
    tipoUsuario: 'ADMIN'
  },
  COMPRADOR: {
    id: 2,
    nombre: 'Comprador',
    apellido: 'Test',
    email: 'comprador@test.com',
    fechaAlta: '2024-01-01',
    activo: true,
    tipoUsuario: 'COMPRADOR'
  },
  CONCESIONARIO: {
    id: 3,
    nombre: 'Concesionaria',
    apellido: 'Test',
    email: 'concesionaria@test.com',
    fechaAlta: '2024-01-01',
    activo: true,
    tipoUsuario: 'CONCESIONARIA'
  }
};

Cypress.Commands.add('loginAs', (tipoUsuario, email) => {
  const user = mockUsers[tipoUsuario];
  const userEmail = email || user.email;
  
  // Mock del token
  const mockToken = `mock-token-${tipoUsuario.toLowerCase()}-${Date.now()}`;
  
  // Configurar localStorage
  cy.window().then((win) => {
    win.localStorage.setItem('token', mockToken);
    win.localStorage.setItem('user', JSON.stringify({ ...user, email: userEmail }));
  });
});

Cypress.Commands.add('logout', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('token');
    win.localStorage.removeItem('user');
  });
});

Cypress.Commands.add('setupBackendMocks', () => {
  // Interceptar todas las llamadas al backend y devolver respuestas mock
  cy.intercept('POST', '**/api/1/compra-tu-auto/auth/login', {
    statusCode: 200,
    body: {
      token: 'mock-token',
      usuario: mockUsers.COMPRADOR
    }
  }).as('mockLogin');

  // Interceptar llamadas de menú (aunque MenuService usa localStorage, por si acaso)
  cy.intercept('GET', '**/api/1/compra-tu-auto/usuarios/mi-menu', (req) => {
    const token = req.headers.authorization;
    if (token) {
      // Retornar menú mock basado en el usuario en localStorage
      req.reply({
        statusCode: 200,
        body: { items: [] } // El MenuService usa localStorage, así que esto es solo backup
      });
    } else {
      req.reply({ statusCode: 401 });
    }
  }).as('mockMenu');

  // Mock para endpoints comunes de usuarios
  cy.intercept('GET', '**/api/1/compra-tu-auto/usuarios**', {
    statusCode: 200,
    body: []
  }).as('mockUsuarios');

  // Mock para endpoints de autos
  cy.intercept('GET', '**/api/1/compra-tu-auto/autos**', {
    statusCode: 200,
    body: []
  }).as('mockAutos');

  // Mock para endpoints de ofertas
  cy.intercept('GET', '**/api/1/compra-tu-auto/ofertas**', {
    statusCode: 200,
    body: []
  }).as('mockOfertas');

  // Mock para endpoints de favoritos
  cy.intercept('GET', '**/api/1/compra-tu-auto/favoritos**', {
    statusCode: 200,
    body: []
  }).as('mockFavoritos');

  // Mock para endpoints de concesionarias
  cy.intercept('GET', '**/api/1/compra-tu-auto/concesionarias**', {
    statusCode: 200,
    body: []
  }).as('mockConcesionarias');

  // Mock para endpoints de compras
  cy.intercept('GET', '**/api/1/compra-tu-auto/compras**', {
    statusCode: 200,
    body: []
  }).as('mockCompras');

  // Mock para endpoints de ventas
  cy.intercept('GET', '**/api/1/compra-tu-auto/ventas**', {
    statusCode: 200,
    body: []
  }).as('mockVentas');

  // Mock para endpoints de resenas
  cy.intercept('GET', '**/api/1/compra-tu-auto/resenas**', {
    statusCode: 200,
    body: []
  }).as('mockResenas');

  // Interceptar cualquier otra llamada al backend para evitar errores
  cy.intercept('**/api/1/compra-tu-auto/**', {
    statusCode: 200,
    body: {}
  }).as('mockApi');
});

export {};
