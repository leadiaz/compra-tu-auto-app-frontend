import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PerfilService } from '../../../services/perfil.service';
import { AuthService } from '../../../services/auth.service';
import { Perfil, PerfilUpdate, CambioPassword } from '../../../models/perfil.model';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
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

  editarPerfil(): void {
    if (this.perfilForm.valid) {
      const update: PerfilUpdate = this.perfilForm.value;
      this.perfilService.actualizarPerfil(update).subscribe({
        next: (perfil) => {
          this.perfil.set(perfil);
          this.mostrarFormEdicion.set(false);
          alert('Perfil actualizado exitosamente');
        },
        error: (error) => {
          console.error('Error al actualizar perfil:', error);
          alert('Error al actualizar perfil. Por favor, intenta nuevamente.');
        }
      });
    }
  }

  cambiarPassword(): void {
    if (this.passwordForm.valid) {
      const cambioPassword: CambioPassword = this.passwordForm.value;
      this.perfilService.cambiarPassword(cambioPassword).subscribe({
        next: () => {
          alert('Contraseña cambiada exitosamente');
          this.passwordForm.reset();
          this.mostrarFormPassword.set(false);
        },
        error: (error) => {
          console.error('Error al cambiar contraseña:', error);
          alert('Error al cambiar contraseña. Verifica que la contraseña actual sea correcta.');
        }
      });
    }
  }

  toggleFormPassword(): void {
    this.mostrarFormPassword.update(val => !val);
  }

  cerrarSesion(): void {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.router.navigate(['/login']);
    }
  }
}

