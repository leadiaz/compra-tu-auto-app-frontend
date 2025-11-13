/// <reference types="cypress" />
describe('Dashboard page', () => {
  it('should show cards and clear notifications', () => {
    cy.visit('/dashboard');
    cy.contains('Bienvenido');
    cy.get('.badge').should('have.attr', 'data-badge', '3');
    cy.contains('Limpiar notificaciones').click();
    cy.get('.badge').should('have.attr', 'data-badge', '0');
    cy.get('.grid .card').should('have.length.at.least', 3);
  });
});
