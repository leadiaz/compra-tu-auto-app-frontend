/// <reference types="cypress" />

import '../support/commands';

describe('Registro de Usuario', () => {
  beforeEach(() => {
    cy.setupBackendMocks();
    cy.visit('/registro');
  });

  describe('Renderizado del formulario', () => {
    it('debe mostrar el formulario de registro correctamente', () => {
      cy.contains('Registro de Usuario').should('be.visible');
      cy.contains('Crea una nueva cuenta').should('be.visible');
      
      // Verificar que todos los campos estén presentes
      cy.get('input#nombre').should('be.visible');
      cy.get('input#apellido').should('be.visible');
      cy.get('input#email').should('be.visible');
      cy.get('input#password').should('be.visible');
      cy.get('input#confirmPassword').should('be.visible');
      
      // Verificar que el selector de tipo de usuario NO esté visible (solo para admin)
      cy.get('select#tipoUsuario').should('not.exist');
      
      // Verificar botón de submit
      cy.get('button[type="submit"]').should('be.visible');
      cy.contains('Registrarse').should('be.visible');
    });

    it('debe mostrar enlace para ir al login', () => {
      cy.contains('¿Ya tienes cuenta?').should('be.visible');
      cy.contains('Inicia sesión aquí').should('be.visible');
      cy.get('a[routerLink="/login"]').should('exist');
    });
  });

  describe('Validación de campos', () => {
    it('debe validar que el nombre es requerido', () => {
      cy.get('button[type="submit"]').click();
      cy.contains('El nombre es requerido').should('be.visible');
    });

    it('debe validar que el nombre tiene al menos 2 caracteres', () => {
      cy.get('input#nombre').type('A');
      cy.get('button[type="submit"]').click();
      cy.contains('El nombre debe tener al menos 2 caracteres').should('be.visible');
    });

    it('debe validar que el apellido es requerido', () => {
      cy.get('input#nombre').type('Juan');
      cy.get('button[type="submit"]').click();
      cy.contains('El apellido es requerido').should('be.visible');
    });

    it('debe validar que el apellido tiene al menos 2 caracteres', () => {
      cy.get('input#nombre').type('Juan');
      cy.get('input#apellido').type('B');
      cy.get('button[type="submit"]').click();
      cy.contains('El apellido debe tener al menos 2 caracteres').should('be.visible');
    });

    it('debe validar formato de email', () => {
      cy.get('input#nombre').type('Juan');
      cy.get('input#apellido').type('Pérez');
      cy.get('input#email').type('email-invalido');
      cy.get('button[type="submit"]').click();
      cy.contains('El formato del email no es válido').should('be.visible');
    });

    it('debe validar que la contraseña es requerida', () => {
      cy.get('input#nombre').type('Juan');
      cy.get('input#apellido').type('Pérez');
      cy.get('input#email').type('juan@example.com');
      cy.get('button[type="submit"]').click();
      cy.contains('La contraseña es requerida').should('be.visible');
    });

    it('debe validar que la contraseña tiene al menos 6 caracteres', () => {
      cy.get('input#nombre').type('Juan');
      cy.get('input#apellido').type('Pérez');
      cy.get('input#email').type('juan@example.com');
      cy.get('input#password').type('12345');
      cy.get('button[type="submit"]').click();
      cy.contains('La contraseña debe tener al menos 6 caracteres').should('be.visible');
    });

    it('debe validar que las contraseñas coinciden', () => {
      cy.get('input#nombre').type('Juan');
      cy.get('input#apellido').type('Pérez');
      cy.get('input#email').type('juan@example.com');
      cy.get('input#password').type('123456');
      cy.get('input#confirmPassword').type('123457');
      cy.get('button[type="submit"]').click();
      cy.contains('Las contraseñas no coinciden').should('be.visible');
    });
  });

  describe('Funcionalidad de mostrar/ocultar contraseña', () => {
    it('debe poder mostrar y ocultar la contraseña', () => {
      cy.get('input#password').type('mipassword123');
      cy.get('input#password').should('have.attr', 'type', 'password');
      
      // Click en el botón de mostrar contraseña
      cy.get('input#password').parent().find('button.password-toggle').click();
      cy.get('input#password').should('have.attr', 'type', 'text');
      
      // Ocultar nuevamente
      cy.get('input#password').parent().find('button.password-toggle').click();
      cy.get('input#password').should('have.attr', 'type', 'password');
    });

    it('debe poder mostrar y ocultar la confirmación de contraseña', () => {
      cy.get('input#confirmPassword').type('mipassword123');
      cy.get('input#confirmPassword').should('have.attr', 'type', 'password');
      
      // Click en el botón de mostrar contraseña
      cy.get('input#confirmPassword').parent().find('button.password-toggle').click();
      cy.get('input#confirmPassword').should('have.attr', 'type', 'text');
    });
  });

  describe('Registro exitoso', () => {
    it('debe mostrar mensaje de éxito al registrar correctamente', () => {
      // Mock del registro exitoso
      cy.intercept('POST', '**/api/1/compra-tu-auto/usuarios', {
        statusCode: 201,
        body: {
          id: 1,
          email: 'nuevo@example.com',
          nombre: 'Nuevo',
          apellido: 'Usuario'
        }
      }).as('mockRegistro');

      cy.get('input#nombre').type('Nuevo');
      cy.get('input#apellido').type('Usuario');
      cy.get('input#email').type('nuevo@example.com');
      cy.get('input#password').type('123456');
      cy.get('input#confirmPassword').type('123456');
      
      cy.get('button[type="submit"]').click();
      cy.wait('@mockRegistro');
      
      cy.contains('Usuario registrado exitosamente').should('be.visible');
      
      // Debe redirigir al login después de 2 segundos
      cy.url({ timeout: 3000 }).should('include', '/login');
    });
  });

  describe('Manejo de errores', () => {
    it('debe mostrar error cuando el email ya existe', () => {
      cy.intercept('POST', '**/api/1/compra-tu-auto/usuarios', {
        statusCode: 409,
        body: {
          message: 'El email ya está registrado'
        }
      }).as('mockErrorEmail');

      cy.get('input#nombre').type('Juan');
      cy.get('input#apellido').type('Pérez');
      cy.get('input#email').type('existente@example.com');
      cy.get('input#password').type('123456');
      cy.get('input#confirmPassword').type('123456');
      
      cy.get('button[type="submit"]').click();
      cy.wait('@mockErrorEmail');
      
      cy.contains('El email ya está registrado').should('be.visible');
    });

    it('debe mostrar error de conexión cuando el servidor no está disponible', () => {
      cy.intercept('POST', '**/api/1/compra-tu-auto/usuarios', {
        statusCode: 0,
        forceNetworkError: true
      }).as('mockErrorConexion');

      cy.get('input#nombre').type('Juan');
      cy.get('input#apellido').type('Pérez');
      cy.get('input#email').type('test@example.com');
      cy.get('input#password').type('123456');
      cy.get('input#confirmPassword').type('123456');
      
      cy.get('button[type="submit"]').click();
      
      cy.contains('Error de conexión').should('be.visible');
    });
  });

  describe('Navegación', () => {
    it('debe navegar al login al hacer click en el enlace', () => {
      cy.contains('Inicia sesión aquí').click();
      cy.url().should('include', '/login');
    });
  });
});

