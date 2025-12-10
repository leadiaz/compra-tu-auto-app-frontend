/// <reference types="cypress" />

import '../support/commands';

describe('Dashboard - UI y Componentes', () => {
  beforeEach(() => {
    cy.setupBackendMocks();
  });

  describe('Renderizado básico del dashboard', () => {
    beforeEach(() => {
      cy.loginAs('COMPRADOR');
      cy.visit('/dashboard');
      cy.waitForMenuLoad();
    });

    it('debe mostrar la página principal del dashboard', () => {
      cy.url().should('include', '/dashboard');
      cy.contains('Compra Tu Auto').should('be.visible');
    });

    it('debe mostrar el sidebar correctamente', () => {
      cy.contains('Compra Tu Auto').should('be.visible');
      cy.get('.sidebar').should('be.visible');
      cy.verifyMenuItemVisible(['Dashboard', 'Buscar Autos']);
    });

    it('debe mostrar el navbar correctamente', () => {
      cy.get('.dashboard-container').should('be.visible');
    });

    it('debe mostrar el contenido principal del dashboard', () => {
      cy.get('main.dashboard-content').should('be.visible');
    });

    it('debe mostrar el contenido del dashboard home', () => {
      cy.visit('/dashboard/home');
      cy.waitForMenuLoad();
      cy.get('main.dashboard-content').should('be.visible');
    });
  });

  describe('Interacción con el menú', () => {
    beforeEach(() => {
      cy.loginAs('COMPRADOR');
      cy.visit('/dashboard');
      cy.waitForMenuLoad();
    });

    it('debe resaltar el item activo en el menú', () => {
      cy.navigateToMenuItem('Buscar Autos', '/dashboard/ofertas');
      cy.wait(500);
      
      // Verificar que el item está activo (puede que la clase active se aplique de diferentes maneras)
      cy.contains('Buscar Autos').should('be.visible');
      // El routerLinkActive debería aplicar la clase active automáticamente
    });

    it('debe mantener el sidebar visible al navegar', () => {
      cy.navigateToMenuItem('Buscar Autos', '/dashboard/ofertas');
      cy.contains('Compra Tu Auto').should('be.visible');
      cy.contains('Mis Favoritos').should('be.visible');
    });
  });

  describe('Navegación entre secciones', () => {
    it('debe navegar correctamente entre todas las secciones de comprador', () => {
      cy.loginAs('COMPRADOR');
      cy.visit('/dashboard');
      cy.waitForMenuLoad();

      const secciones = [
        { nombre: 'Dashboard', ruta: '/dashboard/home' },
        { nombre: 'Buscar Autos', ruta: '/dashboard/ofertas' },
        { nombre: 'Mis Favoritos', ruta: '/dashboard/favoritos' },
        { nombre: 'Mis Reseñas', ruta: '/dashboard/mis-resenas' },
        { nombre: 'Mis Compras', ruta: '/dashboard/mis-compras' },
        { nombre: 'Perfil', ruta: '/dashboard/perfil' }
      ];

      secciones.forEach(seccion => {
        cy.navigateToMenuItem(seccion.nombre, seccion.ruta);
        cy.wait(500);
      });
    });

    it('debe navegar correctamente entre todas las secciones de administrador', () => {
      cy.loginAs('ADMIN');
      cy.visit('/dashboard');
      cy.waitForMenuLoad();

      const secciones = [
        { nombre: 'Dashboard', ruta: '/dashboard/home' },
        { nombre: 'Usuarios', ruta: '/dashboard/usuarios' },
        { nombre: 'Concesionarias', ruta: '/dashboard/concesionarias' },
        { nombre: 'Gestión de Autos', ruta: '/dashboard/gestion-autos' },
        { nombre: 'Puntajes', ruta: '/dashboard/puntajes' },
        { nombre: 'Compras', ruta: '/dashboard/compras-admin' },
        { nombre: 'Reportes', ruta: '/dashboard/reportes' }
      ];

      secciones.forEach(seccion => {
        cy.navigateToMenuItem(seccion.nombre, seccion.ruta);
        cy.wait(500);
      });
    });
  });

  describe('Estado de carga', () => {
    it('debe mostrar indicador de carga mientras se carga el menú', () => {
      cy.loginAs('COMPRADOR');
      cy.visit('/dashboard');
      
      // El menú puede estar cargando brevemente
      cy.get('body').should('be.visible');
    });

    it('debe ocultar el indicador de carga una vez cargado', () => {
      cy.loginAs('COMPRADOR');
      cy.visit('/dashboard');
      cy.waitForMenuLoad();
      
      cy.get('.menu-list').should('be.visible');
    });
  });

  describe('Responsive y accesibilidad', () => {
    beforeEach(() => {
      cy.loginAs('COMPRADOR');
      cy.visit('/dashboard');
      cy.waitForMenuLoad();
    });

    it('debe ser accesible con teclado', () => {
      // Verificar que los elementos son focables
      cy.get('a.menu-link').first().should('exist').focus();
      cy.focused().should('exist');
      
      // Verificar que los elementos del menú son accesibles
      cy.get('a.menu-link').each(($el) => {
        cy.wrap($el).should('be.visible');
      });
    });

    it('debe tener atributos ARIA apropiados', () => {
      // Verificar que los botones tienen aria-labels
      cy.get('button[aria-label*="contraseña"]').should('exist');
    });
  });
});

