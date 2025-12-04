/// <reference types="cypress" />

import '../support/commands';

describe('Login page', () => {
  beforeEach(() => {
    // Configurar mocks antes de cada test
    cy.setupBackendMocks();
    cy.visit('/login');
  });

  it('should render login form', () => {
    cy.contains('Iniciar Sesión');
    cy.get('input#email').should('be.visible');
    cy.get('input#password').should('be.visible');
    cy.get('button[type="submit"]').should('be.enabled');
  });

  it('should validate email and password', () => {
    // Enviar el formulario vacío para mostrar errores requeridos
    cy.get('button[type="submit"]').click();

    cy.get('input#email').type('no-es-email');
    cy.get('input#password').type('123');
    cy.get('button[type="submit"]').click();

    cy.contains('El formato del email no es válido');
    cy.contains('La contraseña debe tener al menos 6 caracteres');
  });

  it('should login and go to dashboard', () => {
    // Mock del login exitoso
    cy.intercept('POST', '**/api/1/compra-tu-auto/auth/login', {
      statusCode: 200,
      body: {
        token: 'mock-token-login',
        usuario: {
          id: 2,
          nombre: 'Usuario',
          apellido: 'Test',
          email: 'user@example.com',
          fechaAlta: '2024-01-01',
          activo: true,
          tipoUsuario: 'COMPRADOR'
        }
      }
    }).as('mockLogin');

    cy.get('input#email').clear().type('user@example.com');
    cy.get('input#password').clear().type('123456');
    cy.get('button[type="submit"]').click();

    // Esperar a que se complete el login
    cy.wait('@mockLogin');
    // La app puede redirigir a /dashboard o /dashboard/home
    cy.location('pathname', { timeout: 5000 }).should('satisfy', (path) => {
      return path === '/dashboard' || path === '/dashboard/home' || path.startsWith('/dashboard/');
    });
  });
});
