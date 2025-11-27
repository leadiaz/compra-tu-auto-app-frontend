import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PerfilService } from '../../../services/perfil.service';
import { AuthService } from '../../../services/auth.service';
import { Perfil, PerfilUpdate, CambioPassword } from '../../../models/perfil.model';

@Component({
  selector: 'app-perfil-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilAdminComponent implements OnInit {
  perfil = signal<Perfil | null>(null);
  isLoading = signal(true);
  mostrarFormPassword = signal(false);
  mostrarFormEdicion = signal(false);
  
  perfilForm: FormGroup;
  passwordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private perfilService: PerfilService,
    private authService: AuthService,
    private router: Router
  ) {
    this.perfilForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['']
    });

    this.passwordForm = this.fb.group({
      passwordActual: ['', Validators.required],
      passwordNuevo: ['', [Validators.required, Validators.minLength(6)]],
      passwordNuevoConfirmacion: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const nuevo = form.get('passwordNuevo');
    const confirmacion = form.get('passwordNuevoConfirmacion');
    if (nuevo && confirmacion && nuevo.value !== confirmacion.value) {
      confirmacion.setErrors({ passwordMismatch: true });
    }
    return null;
  }

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.isLoading.set(true);
    this.perfilService.obtenerPerfil().subscribe({
      next: (perfil) => {
        this.perfil.set(perfil);
        this.perfilForm.patchValue({
          nombre: perfil.nombre,
          apellido: perfil.apellido,
          email: perfil.email,
          telefono: perfil.telefono || ''
        });
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar perfil:', error);
        this.isLoading.set(false);
      }
    });
  }

  abrirFormEdicion(): void {
    this.mostrarFormEdicion.set(true);
  }

  cancelarEdicion(): void {
    this.mostrarFormEdicion.set(false);
    this.perfilForm.patchValue({
      nombre: this.perfil()?.nombre || '',
      apellido: this.perfil()?.apellido || '',
      email: this.perfil()?.email || '',
      telefono: this.perfil()?.telefono || ''
    });
  }

  guardarPerfil(): void {
    if (this.perfilForm.valid) {
      this.isLoading.set(true);
      const datos: PerfilUpdate = this.perfilForm.value;
      
      this.perfilService.actualizarPerfil(datos).subscribe({
        next: (perfil) => {
          this.perfil.set(perfil);
          this.mostrarFormEdicion.set(false);
          this.isLoading.set(false);
          alert('Perfil actualizado exitosamente');
        },
        error: (error) => {
          console.error('Error al actualizar perfil:', error);
          alert('Error al actualizar el perfil. Por favor, intenta nuevamente.');
          this.isLoading.set(false);
        }
      });
    }
  }

  abrirFormPassword(): void {
    this.mostrarFormPassword.set(true);
    this.passwordForm.reset();
  }

  cancelarCambioPassword(): void {
    this.mostrarFormPassword.set(false);
    this.passwordForm.reset();
  }

  cambiarPassword(): void {
    if (this.passwordForm.valid) {
      this.isLoading.set(true);
      const datos: CambioPassword = {
        passwordActual: this.passwordForm.get('passwordActual')?.value,
        passwordNuevo: this.passwordForm.get('passwordNuevo')?.value,
        passwordNuevoConfirmacion: this.passwordForm.get('passwordNuevoConfirmacion')?.value
      };
      
      this.perfilService.cambiarPassword(datos).subscribe({
        next: () => {
          this.mostrarFormPassword.set(false);
          this.passwordForm.reset();
          this.isLoading.set(false);
          alert('Contraseña actualizada exitosamente');
        },
        error: (error) => {
          console.error('Error al cambiar contraseña:', error);
          alert('Error al cambiar la contraseña. Verifica que la contraseña actual sea correcta.');
          this.isLoading.set(false);
        }
      });
    }
  }

  formatearFecha(fecha?: string): string {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-AR');
  }

  getFieldError(fieldName: string): string {
    const field = this.perfilForm.get(fieldName) || this.passwordForm.get(fieldName);
    
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return 'Este campo es requerido';
      }
      if (field.errors['email']) {
        return 'El formato del email no es válido';
      }
      if (field.errors['minlength']) {
        return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['passwordMismatch']) {
        return 'Las contraseñas no coinciden';
      }
    }
    
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.perfilForm.get(fieldName) || this.passwordForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }
}

