/// <reference types="cypress" />
describe('Login page', () => {
  beforeEach(() => {
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
    cy.get('input#email').clear().type('user@example.com');
    cy.get('input#password').clear().type('123456');
    cy.get('button[type="submit"]').click();

    // Simulación tiene delay 2s
    cy.location('pathname', { timeout: 5000 }).should('eq', '/dashboard');
    cy.contains('Bienvenido');
  });
});
