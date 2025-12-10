/// <reference types="cypress" />

import '../support/commands';

describe('Navegación y Routing', () => {
  beforeEach(() => {
    cy.setupBackendMocks();
  });

  describe('Redirecciones básicas', () => {
    it('debe redirigir a /login desde la raíz', () => {
      cy.visit('/');
      cy.url().should('include', '/login');
    });

    it('debe redirigir a /login desde rutas no encontradas', () => {
      cy.visit('/ruta-inexistente');
      cy.url().should('include', '/login');
    });

    it('debe redirigir a /dashboard/home desde /dashboard', () => {
      cy.loginAs('COMPRADOR');
      cy.visit('/dashboard');
      cy.url().should('satisfy', (url) => {
        return url === Cypress.config().baseUrl + '/dashboard/home' || 
               url.includes('/dashboard/home');
      });
    });
  });

  describe('Navegación entre páginas públicas', () => {
    it('debe navegar de login a registro', () => {
      cy.visit('/login');
      cy.contains('Regístrate aquí').click();
      cy.url().should('include', '/registro');
    });

    it('debe navegar de registro a login', () => {
      cy.visit('/registro');
      cy.contains('Inicia sesión aquí').click();
      cy.url().should('include', '/login');
    });
  });

  describe('Navegación después del login', () => {
    it('debe redirigir al dashboard después del login exitoso', () => {
      cy.intercept('POST', '**/api/1/compra-tu-auto/auth/login', {
        statusCode: 200,
        body: {
          token: 'mock-token',
          usuario: {
            id: 1,
            email: 'test@example.com',
            tipoUsuario: 'COMPRADOR'
          }
        }
      }).as('mockLogin');

      cy.visit('/login');
      cy.get('input#email').type('test@example.com');
      cy.get('input#password').type('123456');
      cy.get('button[type="submit"]').click();
      cy.wait('@mockLogin');
      
      cy.url({ timeout: 5000 }).should('satisfy', (url) => {
        return url.includes('/dashboard');
      });
    });
  });

  describe('Navegación con browser back/forward', () => {
    it('debe funcionar correctamente con el botón atrás del navegador', () => {
      cy.loginAs('COMPRADOR');
      cy.visit('/dashboard');
      cy.contains('Cargando menú...', { timeout: 1000 }).should('not.exist');
      
      cy.contains('Buscar Autos').click();
      cy.url().should('include', '/dashboard/ofertas');
      
      cy.go('back');
      cy.url().should('satisfy', (url) => {
        return url.includes('/dashboard');
      });
    });

    it('debe redirigir a login si se usa back después de logout', () => {
      cy.loginAs('COMPRADOR');
      cy.visit('/dashboard');
      cy.contains('Cargando menú...', { timeout: 1000 }).should('not.exist');
      
      cy.contains('Cerrar Sesión').click();
      cy.url().should('include', '/login');
      
      cy.go('back');
      cy.url().should('include', '/login');
    });
  });

  describe('Navegación directa por URL', () => {
    it('debe permitir navegación directa a rutas permitidas', () => {
      cy.loginAs('COMPRADOR');
      cy.visit('/dashboard/favoritos');
      cy.url().should('include', '/dashboard/favoritos');
    });

    it('debe bloquear navegación directa a rutas no permitidas', () => {
      cy.loginAs('COMPRADOR');
      cy.visit('/dashboard/usuarios');
      cy.url().should('not.include', '/dashboard/usuarios');
    });
  });

  describe('Parámetros de query', () => {
    it('debe preservar returnUrl en query params cuando redirige a login', () => {
      cy.visit('/dashboard/usuarios');
      cy.url().should('include', '/login');
      cy.url().should('include', 'returnUrl');
    });

    it('debe manejar URLs con parámetros de query correctamente', () => {
      cy.loginAs('COMPRADOR');
      cy.visit('/dashboard?param=test');
      cy.url().should('include', '/dashboard');
    });
  });

  describe('Navegación con deep linking', () => {
    it('debe manejar rutas con parámetros dinámicos', () => {
      cy.loginAs('COMPRADOR');
      // Intentar acceder a una ruta con parámetro
      cy.visit('/dashboard/autos/123');
      // Puede redirigir o cargar la página según implementación
      cy.url().should('satisfy', (url) => {
        return url.includes('/dashboard');
      });
    });

    it('debe manejar rutas con múltiples segmentos', () => {
      cy.loginAs('ADMIN');
      cy.visit('/dashboard/gestion-autos');
      cy.url().should('include', '/dashboard/gestion-autos');
    });
  });

  describe('Navegación rápida entre secciones', () => {
    it('debe permitir navegar rápidamente entre múltiples secciones', () => {
      cy.loginAs('COMPRADOR');
      cy.visit('/dashboard');
      cy.contains('Cargando menú...', { timeout: 1000 }).should('not.exist');

      const secciones = [
        'Buscar Autos',
        'Mis Favoritos',
        'Mis Reseñas',
        'Mis Compras',
        'Perfil'
      ];

      secciones.forEach(seccion => {
        cy.contains(seccion).click();
        cy.wait(300);
        // Verificar que la URL cambió correctamente
        cy.url().should('include', '/dashboard');
      });

      // Verificar que la última sección está visible y accesible
      cy.contains('Perfil').should('be.visible');
      cy.url().should('include', '/dashboard/perfil');
    });
  });
});

