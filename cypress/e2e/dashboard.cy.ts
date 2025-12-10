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
    cy.waitForMenuLoad();
    
    // Verificar que el sidebar está visible
    cy.contains('Compra Tu Auto').should('be.visible');
  });

  it('should show dashboard home content', () => {
    cy.visit('/dashboard/home');
    cy.waitForMenuLoad();
    
    // Verificar que el contenido del dashboard está presente
    // (Ajusta estos selectores según el contenido real de tu dashboard-home)
    cy.get('main.dashboard-content').should('be.visible');
  });

  it('should have sidebar navigation visible', () => {
    cy.visit('/dashboard');
    cy.waitForMenuLoad();
    
    // Verificar elementos del sidebar
    cy.contains('Compra Tu Auto').should('be.visible');
    cy.verifyMenuItemVisible(['Dashboard', 'Buscar Autos']);
  });
});
