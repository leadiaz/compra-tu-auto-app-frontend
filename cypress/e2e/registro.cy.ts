/// <reference types="cypress" />

import '../support/commands';
import { TEST_PASSWORDS, TEST_EMAILS, TEST_USERS } from '../support/test-constants';

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
      cy.verifyRegistrationFormFields();
      
      // Verificar que el selector de tipo de usuario NO esté visible (solo para admin)
      cy.get('select#tipoUsuario').should('not.exist');
      
      // Verificar botón de submit
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
      cy.submitRegistrationForm();
      cy.verifyValidationMessage('El nombre es requerido');
    });

    it('debe validar que el nombre tiene al menos 2 caracteres', () => {
      cy.fillRegistrationForm({ nombre: 'A' });
      cy.submitRegistrationForm();
      cy.verifyValidationMessage('El nombre debe tener al menos 2 caracteres');
    });

    it('debe validar que el apellido es requerido', () => {
      cy.fillRegistrationForm({ nombre: TEST_USERS.NOMBRE });
      cy.submitRegistrationForm();
      cy.verifyValidationMessage('El apellido es requerido');
    });

    it('debe validar que el apellido tiene al menos 2 caracteres', () => {
      cy.fillRegistrationForm({ nombre: TEST_USERS.NOMBRE, apellido: 'B' });
      cy.submitRegistrationForm();
      cy.verifyValidationMessage('El apellido debe tener al menos 2 caracteres');
    });

    it('debe validar formato de email', () => {
      cy.fillRegistrationForm({
        nombre: TEST_USERS.NOMBRE,
        apellido: TEST_USERS.APELLIDO,
        email: TEST_EMAILS.INVALID_FORMAT
      });
      cy.submitRegistrationForm();
      cy.verifyValidationMessage('El formato del email no es válido');
    });

    it('debe validar que la contraseña es requerida', () => {
      cy.fillRegistrationForm({
        nombre: TEST_USERS.NOMBRE,
        apellido: TEST_USERS.APELLIDO,
        email: TEST_EMAILS.VALID
      });
      cy.submitRegistrationForm();
      cy.verifyValidationMessage('La contraseña es requerida');
    });

    it('debe validar que la contraseña tiene al menos 6 caracteres', () => {
      cy.fillRegistrationForm({
        nombre: TEST_USERS.NOMBRE,
        apellido: TEST_USERS.APELLIDO,
        email: TEST_EMAILS.VALID,
        password: TEST_PASSWORDS.TOO_SHORT
      });
      cy.submitRegistrationForm();
      cy.verifyValidationMessage('La contraseña debe tener al menos 6 caracteres');
    });

    it('debe validar que las contraseñas coinciden', () => {
      cy.fillRegistrationForm({
        nombre: TEST_USERS.NOMBRE,
        apellido: TEST_USERS.APELLIDO,
        email: TEST_EMAILS.VALID,
        password: TEST_PASSWORDS.VALID,
        confirmPassword: TEST_PASSWORDS.MISMATCH
      });
      cy.submitRegistrationForm();
      cy.verifyValidationMessage('Las contraseñas no coinciden');
    });
  });

  describe('Funcionalidad de mostrar/ocultar contraseña', () => {
    it('debe poder mostrar y ocultar la contraseña', () => {
      cy.get('input#password').type(TEST_PASSWORDS.FOR_TOGGLE);
      cy.verifyPasswordFieldType('password', 'password');
      
      // Click en el botón de mostrar contraseña
      cy.togglePasswordVisibility('password');
      cy.verifyPasswordFieldType('password', 'text');
      
      // Ocultar nuevamente
      cy.togglePasswordVisibility('password');
      cy.verifyPasswordFieldType('password', 'password');
    });

    it('debe poder mostrar y ocultar la confirmación de contraseña', () => {
      cy.get('input#confirmPassword').type(TEST_PASSWORDS.FOR_TOGGLE);
      cy.verifyPasswordFieldType('confirmPassword', 'password');
      
      // Click en el botón de mostrar contraseña
      cy.togglePasswordVisibility('confirmPassword');
      cy.verifyPasswordFieldType('confirmPassword', 'text');
    });
  });

  describe('Registro exitoso', () => {
    it('debe mostrar mensaje de éxito al registrar correctamente', () => {
      // Mock del registro exitoso
      cy.intercept('POST', '**/api/1/compra-tu-auto/usuarios', {
        statusCode: 201,
        body: {
          id: 1,
          email: TEST_EMAILS.NEW,
          nombre: TEST_USERS.NOMBRE_NUEVO,
          apellido: TEST_USERS.APELLIDO_NUEVO
        }
      }).as('mockRegistro');

      cy.fillRegistrationForm({
        nombre: TEST_USERS.NOMBRE_NUEVO,
        apellido: TEST_USERS.APELLIDO_NUEVO,
        email: TEST_EMAILS.NEW,
        password: TEST_PASSWORDS.VALID,
        confirmPassword: TEST_PASSWORDS.VALID
      });
      
      cy.submitRegistrationForm();
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

      cy.fillRegistrationForm({
        nombre: TEST_USERS.NOMBRE,
        apellido: TEST_USERS.APELLIDO,
        email: TEST_EMAILS.EXISTING,
        password: TEST_PASSWORDS.VALID,
        confirmPassword: TEST_PASSWORDS.VALID
      });
      
      cy.submitRegistrationForm();
      cy.wait('@mockErrorEmail');
      
      cy.verifyValidationMessage('El email ya está registrado');
    });

    it('debe mostrar error de conexión cuando el servidor no está disponible', () => {
      cy.intercept('POST', '**/api/1/compra-tu-auto/usuarios', {
        statusCode: 0,
        forceNetworkError: true
      }).as('mockErrorConexion');

      cy.fillRegistrationForm({
        nombre: TEST_USERS.NOMBRE,
        apellido: TEST_USERS.APELLIDO,
        email: TEST_EMAILS.VALID,
        password: TEST_PASSWORDS.VALID,
        confirmPassword: TEST_PASSWORDS.VALID
      });
      
      cy.submitRegistrationForm();
      
      cy.verifyValidationMessage('Error de conexión');
    });
  });

  describe('Navegación', () => {
    it('debe navegar al login al hacer click en el enlace', () => {
      cy.contains('Inicia sesión aquí').click();
      cy.url().should('include', '/login');
    });
  });
});

