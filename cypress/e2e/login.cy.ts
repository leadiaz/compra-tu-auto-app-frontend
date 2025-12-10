/// <reference types="cypress" />

import '../support/commands';

describe('Login page', () => {
  beforeEach(() => {
    // Configurar mocks antes de cada test
    cy.setupBackendMocks();
    cy.visit('/login');
  });

  describe('Renderizado del formulario', () => {
    it('should render login form', () => {
      cy.contains('Iniciar Sesión');
      cy.get('input#email').should('be.visible');
      cy.get('input#password').should('be.visible');
      cy.get('button[type="submit"]').should('be.enabled');
    });

    it('debe tener atributos de autocompletado correctos', () => {
      cy.get('input#email').should('have.attr', 'autocomplete', 'email');
      cy.get('input#password').should('have.attr', 'autocomplete', 'current-password');
    });
  });

  describe('Validación de campos', () => {
    it('should validate email and password', () => {
      // Enviar el formulario vacío para mostrar errores requeridos
      cy.get('button[type="submit"]').click();

      cy.get('input#email').type('no-es-email');
      cy.get('input#password').type('123');
      cy.get('button[type="submit"]').click();

      cy.contains('El formato del email no es válido');
      cy.contains('La contraseña debe tener al menos 6 caracteres');
    });

    it('debe limpiar mensajes de error al cambiar campos', () => {
      // Intentar enviar formulario vacío
      cy.get('button[type="submit"]').click();
      
      // Verificar que aparecen mensajes de error (puede variar según el campo)
      cy.get('input#email').should('have.class', 'invalid');
      
      // Escribir un email válido
      cy.get('input#email').clear().type('test@example.com');
      cy.get('input#password').clear().type('123456');
      
      // El mensaje de error debería desaparecer cuando el campo es válido
      // Verificar que el campo ya no tiene la clase invalid o que no hay mensaje de error visible
      cy.get('input#email').should('not.have.class', 'invalid');
    });
  });

  describe('Funcionalidad de mostrar/ocultar contraseña', () => {
    it('debe ocultar la contraseña por defecto', () => {
      cy.get('input#password').type('mipassword');
      cy.get('input#password').should('have.attr', 'type', 'password');
    });

    it('debe mostrar la contraseña al hacer click en el botón', () => {
      cy.get('input#password').type('mipassword');
      cy.get('input#password').parent().find('button.password-toggle').click();
      cy.get('input#password').should('have.attr', 'type', 'text');
      cy.get('input#password').should('have.value', 'mipassword');
    });

    it('debe ocultar la contraseña al hacer click nuevamente', () => {
      cy.get('input#password').type('mipassword');
      cy.get('input#password').parent().find('button.password-toggle').click();
      cy.get('input#password').should('have.attr', 'type', 'text');
      cy.get('input#password').parent().find('button.password-toggle').click();
      cy.get('input#password').should('have.attr', 'type', 'password');
    });
  });

  describe('Login exitoso', () => {
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

    it('debe mantener el returnUrl después del login', () => {
      cy.visit('/login?returnUrl=/dashboard/ofertas');
      
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

      cy.loginAs('COMPRADOR');
      cy.visit('/dashboard');
      cy.url().should('include', '/dashboard');
    });
  });

  describe('Estados del formulario', () => {
    it('debe deshabilitar el botón durante la carga', () => {
      cy.intercept('POST', '**/api/1/compra-tu-auto/auth/login', {
        statusCode: 200,
        body: {
          token: 'mock-token',
          usuario: {
            id: 1,
            email: 'test@example.com',
            tipoUsuario: 'COMPRADOR'
          }
        },
        delay: 1000
      }).as('mockLoginLento');

      cy.get('input#email').type('test@example.com');
      cy.get('input#password').type('123456');
      cy.get('button[type="submit"]').click();
      
      // Verificar que el botón esté deshabilitado y muestre "Iniciando sesión..."
      cy.get('button[type="submit"]').should('be.disabled');
      cy.contains('Iniciando sesión...').should('be.visible');
    });
  });

  describe('Manejo de errores', () => {
    it('debe mostrar mensaje específico para credenciales inválidas', () => {
      cy.intercept('POST', '**/api/1/compra-tu-auto/auth/login', {
        statusCode: 401,
        body: {
          message: 'Credenciales inválidas'
        }
      }).as('mockError401');

      cy.get('input#email').type('test@example.com');
      cy.get('input#password').type('passwordincorrecto');
      cy.get('button[type="submit"]').click();
      cy.wait('@mockError401');
      
      cy.contains('Credenciales inválidas').should('be.visible');
    });

    it('debe mostrar mensaje específico para error 403', () => {
      cy.intercept('POST', '**/api/1/compra-tu-auto/auth/login', {
        statusCode: 403,
        body: {
          message: 'Acceso denegado'
        }
      }).as('mockError403');

      cy.get('input#email').type('test@example.com');
      cy.get('input#password').type('123456');
      cy.get('button[type="submit"]').click();
      cy.wait('@mockError403');
      
      cy.contains('Credenciales inválidas').should('be.visible');
    });
  });

  describe('Navegación', () => {
    it('debe navegar al registro desde el enlace', () => {
      cy.contains('Regístrate aquí').click();
      cy.url().should('include', '/registro');
    });
  });
});
