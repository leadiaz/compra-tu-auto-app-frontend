import { Component, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { TipoUsuario } from '../../models/auth.model';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent implements OnInit {
  registroForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  submitted = signal(false);
  isAdmin = signal(false);

  tiposUsuario = [
    { value: TipoUsuario.COMPRADOR, label: 'Comprador' },
    { value: TipoUsuario.CONCESIONARIO, label: 'Concesionario' },
    { value: TipoUsuario.ADMIN, label: 'Administrador' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registroForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      tipoUsuario: [TipoUsuario.COMPRADOR, Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.isAdmin.set(this.authService.isAdmin());
    
    // Si no es admin, setear tipoUsuario como COMPRADOR y deshabilitar el campo
    if (!this.isAdmin()) {
      this.registroForm.patchValue({ tipoUsuario: TipoUsuario.COMPRADOR });
      this.registroForm.get('tipoUsuario')?.disable();
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    if (confirmPassword?.hasError('passwordMismatch')) {
      confirmPassword.setErrors(null);
    }
    
    return null;
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  onSubmit(): void {
    this.submitted.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.registroForm.valid) {
      this.isLoading.set(true);

      const formValue = this.registroForm.getRawValue();
      const registroData = {
        email: formValue.email,
        password: formValue.password,
        nombre: formValue.nombre,
        apellido: formValue.apellido,
        tipoUsuario: formValue.tipoUsuario
      };

      this.authService.register(registroData).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.successMessage.set('Usuario registrado exitosamente');
          
          // Si es admin, limpiar el formulario después de 2 segundos
          // Si no es admin, redirigir al login
          if (this.isAdmin()) {
            setTimeout(() => {
              this.registroForm.reset();
              this.registroForm.patchValue({ tipoUsuario: TipoUsuario.COMPRADOR });
              this.submitted.set(false);
              this.successMessage.set('');
            }, 2000);
          } else {
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          }
        },
        error: (error) => {
          this.isLoading.set(false);
          if (error.status === 400 || error.status === 409) {
            this.errorMessage.set(error.error?.message || 'El email ya está registrado o los datos son inválidos.');
          } else if (error.status === 0) {
            this.errorMessage.set('Error de conexión. Por favor, verifica que el servidor esté disponible.');
          } else {
            this.errorMessage.set(error.error?.message || 'Error al registrar el usuario. Por favor, intenta nuevamente.');
          }
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registroForm.controls).forEach(key => {
      const control = this.registroForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.registroForm.get(fieldName);
    
    if (field?.errors && (field.touched || this.submitted())) {
      if (field.errors['required']) {
        const labels: { [key: string]: string } = {
          email: 'El email es requerido',
          password: 'La contraseña es requerida',
          confirmPassword: 'La confirmación de contraseña es requerida',
          nombre: 'El nombre es requerido',
          apellido: 'El apellido es requerido',
          tipoUsuario: 'El tipo de usuario es requerido'
        };
        return labels[fieldName] || 'Este campo es requerido';
      }
      if (field.errors['email']) {
        return 'El formato del email no es válido';
      }
      if (field.errors['minlength']) {
        if (fieldName === 'password') {
          return 'La contraseña debe tener al menos 6 caracteres';
        }
        return `El ${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['passwordMismatch']) {
        return 'Las contraseñas no coinciden';
      }
    }
    
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registroForm.get(fieldName);
    return !!(field?.invalid && (field.touched || this.submitted()));
  }
}

