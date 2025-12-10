import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PerfilService } from '../../../services/perfil.service';
import { ConcesionariaService } from '../../../services/concesionaria.service';
import { AuthService } from '../../../services/auth.service';
import { Perfil, PerfilUpdate, CambioPassword } from '../../../models/perfil.model';
import { Concesionaria, ConcesionariaUpdate } from '../../../models/concesionaria.model';

@Component({
  selector: 'app-perfil-concesionaria',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilConcesionariaComponent implements OnInit {
  perfil = signal<Perfil | null>(null);
  concesionaria = signal<Concesionaria | null>(null);
  isLoading = signal(true);
  mostrarFormPassword = signal(false);
  mostrarFormEdicionPerfil = signal(false);
  mostrarFormEdicionConcesionaria = signal(false);
  
  perfilForm: FormGroup;
  concesionariaForm: FormGroup;
  passwordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private perfilService: PerfilService,
    private concesionariaService: ConcesionariaService,
    private authService: AuthService,
    private router: Router
  ) {
    this.perfilForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['']
    });

    this.concesionariaForm = this.fb.group({
      razonSocial: ['', Validators.required],
      cuit: [''],
      direccion: [''],
      telefono: [''],
      email: ['']
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
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.isLoading.set(true);
    
    // Cargar perfil
    this.perfilService.obtenerPerfil().subscribe({
      next: (perfil) => {
        this.perfil.set(perfil);
        this.perfilForm.patchValue({
          nombre: perfil.nombre,
          apellido: perfil.apellido,
          email: perfil.email,
          telefono: perfil.telefono || ''
        });
        this.cargarConcesionaria();
      },
      error: (error) => {
        console.error('Error al cargar perfil:', error);
        this.isLoading.set(false);
      }
    });
  }

  cargarConcesionaria(): void {
    this.concesionariaService.obtenerMiConcesionaria().subscribe({
      next: (concesionaria) => {
        this.concesionaria.set(concesionaria);
        this.concesionariaForm.patchValue({
          razonSocial: concesionaria.razonSocial,
          cuit: concesionaria.cuit || '',
          direccion: concesionaria.direccion || '',
          telefono: concesionaria.telefono || '',
          email: concesionaria.email || ''
        });
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar concesionaria:', error);
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
          this.mostrarFormEdicionPerfil.set(false);
          alert('Perfil actualizado exitosamente');
        },
        error: (error) => {
          console.error('Error al actualizar perfil:', error);
          alert('Error al actualizar perfil. Por favor, intenta nuevamente.');
        }
      });
    }
  }

  editarConcesionaria(): void {
    if (this.concesionariaForm.valid) {
      const update: ConcesionariaUpdate = this.concesionariaForm.value;
      this.concesionariaService.actualizarConcesionaria(update).subscribe({
        next: (concesionaria) => {
          this.concesionaria.set(concesionaria);
          this.mostrarFormEdicionConcesionaria.set(false);
          alert('Información de la concesionaria actualizada exitosamente');
        },
        error: (error) => {
          console.error('Error al actualizar concesionaria:', error);
          alert('Error al actualizar la información. Por favor, intenta nuevamente.');
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

  toggleFormEdicionPerfil(): void {
    this.mostrarFormEdicionPerfil.update(val => !val);
  }

  toggleFormEdicionConcesionaria(): void {
    this.mostrarFormEdicionConcesionaria.update(val => !val);
  }

  cerrarSesion(): void {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.router.navigate(['/login']);
    }
  }

  formatearFecha(fecha?: string): string {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-AR');
  }
}

