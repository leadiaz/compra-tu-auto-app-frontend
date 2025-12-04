/// <reference types="cypress" />

import '../support/commands';

describe('Dashboard page', () => {
  beforeEach(() => {
    // Configurar mocks y login antes de cada test
    cy.setupBackendMocks();
    cy.loginAs('COMPRADOR');
  });

  it('should show dashboard home page', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/dashboard');
    
    // Esperar a que cargue el menú
    cy.contains('Cargando menú...', { timeout: 1000 }).should('not.exist');
    
    // Verificar que el sidebar está visible
    cy.contains('Compra Tu Auto').should('be.visible');
  });

  it('should show dashboard home content', () => {
    cy.visit('/dashboard/home');
    
    // Esperar a que cargue el menú
    cy.contains('Cargando menú...', { timeout: 1000 }).should('not.exist');
    
    // Verificar que el contenido del dashboard está presente
    // (Ajusta estos selectores según el contenido real de tu dashboard-home)
    cy.get('main.dashboard-content').should('be.visible');
  });

  it('should have sidebar navigation visible', () => {
    cy.visit('/dashboard');
    
    // Esperar a que cargue el menú
    cy.contains('Cargando menú...', { timeout: 1000 }).should('not.exist');
    
    // Verificar elementos del sidebar
    cy.contains('Compra Tu Auto').should('be.visible');
    cy.contains('Dashboard').should('be.visible');
    cy.contains('Buscar Autos').should('be.visible');
  });
});
