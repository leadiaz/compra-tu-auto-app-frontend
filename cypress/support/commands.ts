// You can add custom Cypress commands here.
// Example: Cypress.Commands.add('login', (email: string, password: string) => { ... });

/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Simula un login sin hacer peticiones al backend
       * Configura localStorage con token y usuario mock
       * @param tipoUsuario - Tipo de usuario: 'ADMIN', 'COMPRADOR' o 'CONCESIONARIO'
       * @param email - Email opcional, si no se proporciona usa el email por defecto del tipo de usuario
       */
      loginAs(tipoUsuario: 'ADMIN' | 'COMPRADOR' | 'CONCESIONARIO', email?: string): Chainable<void>;
      
      /**
       * Limpia la sesión del usuario
       * Elimina token y usuario de localStorage
       */
      logout(): Chainable<void>;
      
      /**
       * Configura mocks para interceptar llamadas al backend
       * Intercepta todas las peticiones HTTP al API y devuelve respuestas mock
       */
      setupBackendMocks(): Chainable<void>;
      
      /**
       * Espera a que el menú termine de cargar
       * Verifica que el mensaje "Cargando menú..." desaparezca
       */
      waitForMenuLoad(): Chainable<void>;
      
      /**
       * Navega a un item del menú y verifica la URL
       * @param menuItem - Texto del item del menú a hacer click
       * @param expectedUrl - URL que se espera después de la navegación
       */
      navigateToMenuItem(menuItem: string, expectedUrl: string): Chainable<void>;
      
      /**
       * Verifica que una ruta está bloqueada para el usuario actual
       * La URL debe incluir '/dashboard' pero no la ruta específica
       * @param route - Ruta que debe estar bloqueada (ej: '/dashboard/usuarios')
       */
      verifyUrlBlocked(route: string): Chainable<void>;
      
      /**
       * Verifica que varios items del menú son visibles
       * @param items - Array de textos de items del menú que deben ser visibles
       */
      verifyMenuItemVisible(items: string[]): Chainable<void>;
      
      /**
       * Verifica que varios items del menú NO son visibles
       * @param items - Array de textos de items del menú que NO deben ser visibles
       */
      verifyMenuItemNotVisible(items: string[]): Chainable<void>;
      
      /**
       * Verifica que una ruta está permitida para el usuario actual
       * Visita la ruta y verifica que la URL incluye la ruta esperada
       * @param route - Ruta que debe estar permitida (ej: '/dashboard/ofertas')
       * @param waitTime - Tiempo de espera opcional después de la visita (default: 500ms)
       */
      verifyRouteAllowed(route: string, waitTime?: number): Chainable<void>;
      
      /**
       * Verifica que el usuario es redirigido al login
       * Útil para verificar que las rutas protegidas redirigen correctamente
       */
      verifyRedirectToLogin(): Chainable<void>;
      
      /**
       * Verifica que localStorage está limpio (sin token ni user)
       * Útil después de hacer logout
       */
      verifyLocalStorageCleaned(): Chainable<void>;
      
      /**
       * Llena el formulario de registro con los datos proporcionados
       * @param data - Objeto con los datos del formulario (nombre, apellido, email, password, confirmPassword)
       */
      fillRegistrationForm(data: {
        nombre?: string;
        apellido?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
      }): Chainable<void>;
      
      /**
       * Envía el formulario de registro haciendo click en el botón submit
       */
      submitRegistrationForm(): Chainable<void>;
      
      /**
       * Verifica que un mensaje de validación es visible
       * @param message - Texto del mensaje de validación a verificar
       */
      verifyValidationMessage(message: string): Chainable<void>;
      
      /**
       * Verifica que los campos del formulario de registro están presentes y visibles
       */
      verifyRegistrationFormFields(): Chainable<void>;
      
      /**
       * Toggle la visibilidad de la contraseña en el campo especificado
       * @param fieldId - ID del campo de contraseña ('password' o 'confirmPassword')
       */
      togglePasswordVisibility(fieldId: 'password' | 'confirmPassword'): Chainable<void>;
      
      /**
       * Verifica que el tipo del campo de contraseña es el esperado
       * @param fieldId - ID del campo de contraseña ('password' o 'confirmPassword')
       * @param expectedType - Tipo esperado ('password' o 'text')
       */
      verifyPasswordFieldType(fieldId: 'password' | 'confirmPassword', expectedType: 'password' | 'text'): Chainable<void>;
      
      /**
       * Verifica que múltiples rutas están bloqueadas para un rol específico
       * Hace login con el rol especificado y verifica que todas las rutas están bloqueadas
       * @param rol - Rol del usuario ('ADMIN', 'COMPRADOR' o 'CONCESIONARIO')
       * @param rutasBloqueadas - Array de rutas que deben estar bloqueadas
       */
      verifyMultipleRoutesBlocked(rol: 'ADMIN' | 'COMPRADOR' | 'CONCESIONARIO', rutasBloqueadas: string[]): Chainable<void>;
    }
  }
}

// Datos mock por tipo de usuario
const mockUsers = {
  ADMIN: {
    id: 1,
    nombre: 'Admin',
    apellido: 'Test',
    email: 'admin@test.com',
    fechaAlta: '2024-01-01',
    activo: true,
    tipoUsuario: 'ADMIN'
  },
  COMPRADOR: {
    id: 2,
    nombre: 'Comprador',
    apellido: 'Test',
    email: 'comprador@test.com',
    fechaAlta: '2024-01-01',
    activo: true,
    tipoUsuario: 'COMPRADOR'
  },
  CONCESIONARIO: {
    id: 3,
    nombre: 'Concesionaria',
    apellido: 'Test',
    email: 'concesionaria@test.com',
    fechaAlta: '2024-01-01',
    activo: true,
    tipoUsuario: 'CONCESIONARIA'
  }
};

Cypress.Commands.add('loginAs', (tipoUsuario, email) => {
  const user = mockUsers[tipoUsuario];
  const userEmail = email || user.email;
  
  // Mock del token
  const mockToken = `mock-token-${tipoUsuario.toLowerCase()}-${Date.now()}`;
  
  // Configurar localStorage
  cy.window().then((win) => {
    win.localStorage.setItem('token', mockToken);
    win.localStorage.setItem('user', JSON.stringify({ ...user, email: userEmail }));
  });
});

Cypress.Commands.add('logout', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('token');
    win.localStorage.removeItem('user');
  });
});

Cypress.Commands.add('setupBackendMocks', () => {
  // Interceptar todas las llamadas al backend y devolver respuestas mock
  cy.intercept('POST', '**/api/1/compra-tu-auto/auth/login', {
    statusCode: 200,
    body: {
      token: 'mock-token',
      usuario: mockUsers.COMPRADOR
    }
  }).as('mockLogin');

  // Interceptar llamadas de menú (aunque MenuService usa localStorage, por si acaso)
  cy.intercept('GET', '**/api/1/compra-tu-auto/usuarios/mi-menu', (req) => {
    const token = req.headers.authorization;
    if (token) {
      // Retornar menú mock basado en el usuario en localStorage
      req.reply({
        statusCode: 200,
        body: { items: [] } // El MenuService usa localStorage, así que esto es solo backup
      });
    } else {
      req.reply({ statusCode: 401 });
    }
  }).as('mockMenu');

  // Mock para endpoints comunes de usuarios
  cy.intercept('GET', '**/api/1/compra-tu-auto/usuarios**', {
    statusCode: 200,
    body: []
  }).as('mockUsuarios');

  // Mock para endpoints de autos
  cy.intercept('GET', '**/api/1/compra-tu-auto/autos**', {
    statusCode: 200,
    body: []
  }).as('mockAutos');

  // Mock para endpoints de ofertas
  cy.intercept('GET', '**/api/1/compra-tu-auto/ofertas**', {
    statusCode: 200,
    body: []
  }).as('mockOfertas');

  // Mock para endpoints de favoritos
  cy.intercept('GET', '**/api/1/compra-tu-auto/favoritos**', {
    statusCode: 200,
    body: []
  }).as('mockFavoritos');

  // Mock para endpoints de concesionarias
  cy.intercept('GET', '**/api/1/compra-tu-auto/concesionarias**', {
    statusCode: 200,
    body: []
  }).as('mockConcesionarias');

  // Mock para endpoints de compras
  cy.intercept('GET', '**/api/1/compra-tu-auto/compras**', {
    statusCode: 200,
    body: []
  }).as('mockCompras');

  // Mock para endpoints de ventas
  cy.intercept('GET', '**/api/1/compra-tu-auto/ventas**', {
    statusCode: 200,
    body: []
  }).as('mockVentas');

  // Mock para endpoints de resenas
  cy.intercept('GET', '**/api/1/compra-tu-auto/resenas**', {
    statusCode: 200,
    body: []
  }).as('mockResenas');

  // Interceptar cualquier otra llamada al backend para evitar errores
  cy.intercept('**/api/1/compra-tu-auto/**', {
    statusCode: 200,
    body: {}
  }).as('mockApi');
});

Cypress.Commands.add('waitForMenuLoad', () => {
  cy.contains('Cargando menú...', { timeout: 1000 }).should('not.exist');
});

Cypress.Commands.add('navigateToMenuItem', (menuItem: string, expectedUrl: string) => {
  cy.waitForMenuLoad();
  cy.contains(menuItem).click();
  cy.url().should('include', expectedUrl);
});

Cypress.Commands.add('verifyUrlBlocked', (route: string) => {
  cy.visit(route);
  cy.url().should('satisfy', (url: string) => {
    return url.includes('/dashboard') && !url.includes(route);
  });
});

Cypress.Commands.add('verifyMenuItemVisible', (items: string[]) => {
  items.forEach((item) => {
    cy.contains(item).should('be.visible');
  });
});

Cypress.Commands.add('verifyMenuItemNotVisible', (items: string[]) => {
  items.forEach((item) => {
    cy.contains(item).should('not.exist');
  });
});

Cypress.Commands.add('verifyRouteAllowed', (route: string, waitTime = 500) => {
  cy.visit(route);
  cy.url().should('include', route);
  cy.wait(waitTime);
});

Cypress.Commands.add('verifyRedirectToLogin', () => {
  cy.url().should('include', '/login');
});

Cypress.Commands.add('verifyLocalStorageCleaned', () => {
  cy.window().then((win) => {
    expect(win.localStorage.getItem('token')).to.be.null;
    expect(win.localStorage.getItem('user')).to.be.null;
  });
});

Cypress.Commands.add('fillRegistrationForm', (data: {
  nombre?: string;
  apellido?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}) => {
  if (data.nombre) {
    cy.get('input#nombre').type(data.nombre);
  }
  if (data.apellido) {
    cy.get('input#apellido').type(data.apellido);
  }
  if (data.email) {
    cy.get('input#email').type(data.email);
  }
  if (data.password) {
    cy.get('input#password').type(data.password);
  }
  if (data.confirmPassword) {
    cy.get('input#confirmPassword').type(data.confirmPassword);
  }
});

Cypress.Commands.add('submitRegistrationForm', () => {
  cy.get('button[type="submit"]').click();
});

Cypress.Commands.add('verifyValidationMessage', (message: string) => {
  cy.contains(message).should('be.visible');
});

Cypress.Commands.add('verifyRegistrationFormFields', () => {
  cy.get('input#nombre').should('be.visible');
  cy.get('input#apellido').should('be.visible');
  cy.get('input#email').should('be.visible');
  cy.get('input#password').should('be.visible');
  cy.get('input#confirmPassword').should('be.visible');
  cy.get('button[type="submit"]').should('be.visible');
});

Cypress.Commands.add('togglePasswordVisibility', (fieldId: 'password' | 'confirmPassword') => {
  cy.get(`input#${fieldId}`).parent().find('button.password-toggle').click();
});

Cypress.Commands.add('verifyPasswordFieldType', (fieldId: 'password' | 'confirmPassword', expectedType: 'password' | 'text') => {
  cy.get(`input#${fieldId}`).should('have.attr', 'type', expectedType);
});

Cypress.Commands.add('verifyMultipleRoutesBlocked', (rol: 'ADMIN' | 'COMPRADOR' | 'CONCESIONARIO', rutasBloqueadas: string[]) => {
  cy.loginAs(rol);
  rutasBloqueadas.forEach((ruta) => {
    cy.verifyUrlBlocked(ruta);
  });
});

// Export para marcar este archivo como módulo ES6 (necesario para 'declare global')
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const __cypressCommandsModule = true;
