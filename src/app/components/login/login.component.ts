import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);
  submitted = signal(false);

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const { email, password } = this.loginForm.value;
      
      // Mapear email a usuario para el backend
      const loginData = {
        usuario: email,
        password: password
      };

      this.authService.login(loginData).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          // Guardar token y usuario en localStorage
          if (response.token) {
            localStorage.setItem('token', response.token);
          }
          if (response.usuario) {
            localStorage.setItem('user', JSON.stringify(response.usuario));
          }
          // Redirigir al dashboard
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading.set(false);
          // Manejar errores de autenticación
          if (error.status === 401 || error.status === 403) {
            this.errorMessage.set('Credenciales inválidas. Por favor, verifica tu usuario y contraseña.');
          } else if (error.status === 0) {
            this.errorMessage.set('Error de conexión. Por favor, verifica que el servidor esté disponible.');
          } else {
            this.errorMessage.set(error.error?.message || 'Error al iniciar sesión. Por favor, intenta nuevamente.');
          }
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    
    if (field?.errors && (field.touched || this.submitted())) {
      if (field.errors['required']) {
        // Concordancia de género: 'email' (masculino) requerido, 'contraseña' (femenino) requerida
        return fieldName === 'email'
          ? 'El email es requerido'
          : 'La contraseña es requerida';
      }
      if (field.errors['email']) {
        return 'El formato del email no es válido';
      }
      if (field.errors['minlength']) {
        return 'La contraseña debe tener al menos 6 caracteres';
      }
    }
    
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field?.invalid && (field.touched || this.submitted()));
  }
}