/// <reference types="cypress" />

import '../support/commands';

describe('Sistema de Permisos y Seguridad', () => {
  beforeEach(() => {
    cy.setupBackendMocks();
  });

  describe('Protección de rutas autenticadas', () => {
    it('debe redirigir a login si se accede a dashboard sin autenticación', () => {
      cy.visit('/dashboard/usuarios');
      cy.url().should('include', '/login');
    });

    it('debe redirigir a login si se accede a cualquier ruta protegida sin autenticación', () => {
      const rutasProtegidas = [
        '/dashboard/ofertas',
        '/dashboard/mis-autos',
        '/dashboard/ventas',
        '/dashboard/perfil'
      ];

      rutasProtegidas.forEach(ruta => {
        cy.visit(ruta);
        cy.url().should('include', '/login');
      });
    });

    it('debe preservar la URL de destino en el query parameter', () => {
      cy.visit('/dashboard/usuarios');
      cy.url().should('include', '/login');
      cy.url().should('include', 'returnUrl');
    });
  });

  describe('Permisos por rol - Comprador', () => {
    beforeEach(() => {
      cy.loginAs('COMPRADOR');
    });

    it('debe permitir acceso solo a rutas de comprador', () => {
      const rutasPermitidas = [
        '/dashboard/ofertas',
        '/dashboard/favoritos',
        '/dashboard/mis-compras',
        '/dashboard/mis-resenas',
        '/dashboard/perfil'
      ];

      rutasPermitidas.forEach(ruta => {
        cy.visit(ruta);
        cy.url().should('include', ruta);
        cy.wait(500);
      });
    });

    it('debe bloquear todas las rutas de administrador', () => {
      const rutasBloqueadas = [
        '/dashboard/usuarios',
        '/dashboard/concesionarias',
        '/dashboard/gestion-autos',
        '/dashboard/puntajes',
        '/dashboard/compras-admin',
        '/dashboard/reportes',
        '/dashboard/perfil-admin'
      ];

      rutasBloqueadas.forEach(ruta => {
        cy.visit(ruta);
        cy.url().should('satisfy', (url) => {
          return url.includes('/dashboard') && !url.includes(ruta);
        });
      });
    });

    it('debe bloquear todas las rutas de concesionaria', () => {
      const rutasBloqueadas = [
        '/dashboard/mis-autos',
        '/dashboard/publicar-auto',
        '/dashboard/ventas',
        '/dashboard/estadisticas',
        '/dashboard/mis-ofertas',
        '/dashboard/perfil-concesionaria'
      ];

      rutasBloqueadas.forEach(ruta => {
        cy.visit(ruta);
        // Verificar que NO está en la ruta bloqueada
        cy.url().should('not.include', ruta);
        // Verificar que está en el dashboard (redirigido)
        cy.url().should('include', '/dashboard');
      });
    });
  });

  describe('Permisos por rol - Concesionaria', () => {
    beforeEach(() => {
      cy.loginAs('CONCESIONARIO');
    });

    it('debe permitir acceso solo a rutas de concesionaria', () => {
      const rutasPermitidas = [
        '/dashboard/mis-autos',
        '/dashboard/publicar-auto',
        '/dashboard/mis-ofertas',
        '/dashboard/ventas',
        '/dashboard/estadisticas',
        '/dashboard/perfil-concesionaria'
      ];

      rutasPermitidas.forEach(ruta => {
        cy.visit(ruta);
        cy.url().should('include', ruta);
        cy.wait(500);
      });
    });

    it('debe bloquear todas las rutas de comprador', () => {
      const rutasBloqueadas = [
        '/dashboard/ofertas',
        '/dashboard/favoritos',
        '/dashboard/mis-compras',
        '/dashboard/mis-resenas',
        '/dashboard/perfil'
      ];

      rutasBloqueadas.forEach(ruta => {
        cy.visit(ruta);
        cy.url().should('satisfy', (url) => {
          return url.includes('/dashboard') && !url.includes(ruta.split('/').pop() || '');
        });
      });
    });
  });

  describe('Permisos por rol - Administrador', () => {
    beforeEach(() => {
      cy.loginAs('ADMIN');
    });

    it('debe permitir acceso a todas las rutas de administrador', () => {
      const rutasPermitidas = [
        '/dashboard/usuarios',
        '/dashboard/concesionarias',
        '/dashboard/gestion-autos',
        '/dashboard/puntajes',
        '/dashboard/compras-admin',
        '/dashboard/reportes',
        '/dashboard/perfil-admin'
      ];

      rutasPermitidas.forEach(ruta => {
        cy.visit(ruta);
        cy.url().should('include', ruta);
        cy.wait(500);
      });
    });

    it('debe bloquear rutas de otros roles', () => {
      const rutasBloqueadas = [
        '/dashboard/ofertas',
        '/dashboard/mis-autos',
        '/dashboard/favoritos'
      ];

      rutasBloqueadas.forEach(ruta => {
        cy.visit(ruta);
        cy.url().should('satisfy', (url) => {
          return url.includes('/dashboard') && !url.includes(ruta.split('/').pop() || '');
        });
      });
    });
  });

  describe('Persistencia de sesión', () => {
    it('debe mantener la sesión al recargar la página', () => {
      cy.loginAs('COMPRADOR');
      cy.visit('/dashboard');
      cy.contains('Cargando menú...', { timeout: 1000 }).should('not.exist');
      
      cy.reload();
      cy.contains('Cargando menú...', { timeout: 1000 }).should('not.exist');
      cy.contains('Buscar Autos').should('be.visible');
    });

    it('debe cerrar sesión correctamente y limpiar localStorage', () => {
      cy.loginAs('COMPRADOR');
      cy.visit('/dashboard');
      cy.contains('Cargando menú...', { timeout: 1000 }).should('not.exist');
      
      cy.contains('Cerrar Sesión').click();
      cy.url().should('include', '/login');
      
      // Verificar que localStorage esté limpio
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.be.null;
        expect(win.localStorage.getItem('user')).to.be.null;
      });
    });

    it('debe redirigir a login si el token expira', () => {
      cy.loginAs('COMPRADOR');
      cy.visit('/dashboard');
      
      // Simular expiración de token eliminándolo
      cy.window().then((win) => {
        win.localStorage.removeItem('token');
      });
      
      // Intentar acceder a una ruta protegida
      cy.visit('/dashboard/ofertas');
      cy.url().should('include', '/login');
    });
  });

  describe('Manejo de usuarios no autorizados', () => {
    it('debe manejar correctamente cuando un usuario intenta acceder a rutas de otro rol múltiples veces', () => {
      cy.loginAs('COMPRADOR');
      
      // Intentar acceder varias veces a rutas no permitidas
      cy.visit('/dashboard/usuarios');
      cy.url().should('not.include', '/dashboard/usuarios');
      
      cy.visit('/dashboard/concesionarias');
      cy.url().should('not.include', '/dashboard/concesionarias');
      
      // Verificar que aún puede acceder a sus rutas permitidas
      cy.visit('/dashboard/ofertas');
      cy.url().should('include', '/dashboard/ofertas');
    });
  });
});

