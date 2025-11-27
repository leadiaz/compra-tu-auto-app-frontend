import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminUsuarioService } from '../../../services/admin-usuario.service';
import { AdminConcesionariaService } from '../../../services/admin-concesionaria.service';
import { UsuarioAdmin, UsuarioAdminCreate, UsuarioAdminUpdate, UsuarioAdminFiltros, UsuarioAdminResponse } from '../../../models/usuario-admin.model';
import { ConcesionariaAdmin } from '../../../models/concesionaria-admin.model';
import { TipoUsuario } from '../../../models/auth.model';

@Component({
  selector: 'app-usuarios-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit {
  filtrosForm: FormGroup;
  usuarios = signal<UsuarioAdmin[]>([]);
  usuariosFiltrados = signal<UsuarioAdmin[]>([]);
  usuariosPaginados = signal<UsuarioAdmin[]>([]);
  isLoading = signal(false);
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(0);
  pageSize = signal(10);
  
  mostrarFiltros = signal(false);
  mostrarModalCrear = signal(false);
  mostrarModalEditar = signal(false);
  mostrarModalEliminar = signal(false);
  mostrarModalActivar = signal(false);
  mostrarModalDesactivar = signal(false);
  mostrarModalDetalle = signal(false);
  
  usuarioSeleccionado = signal<UsuarioAdmin | null>(null);
  concesionarias = signal<ConcesionariaAdmin[]>([]);
  
  tiposUsuario = [
    { value: TipoUsuario.COMPRADOR, label: 'Comprador' },
    { value: TipoUsuario.CONCESIONARIO, label: 'Concesionaria' },
    { value: TipoUsuario.ADMIN, label: 'Administrador' }
  ];

  usuarioForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private adminUsuarioService: AdminUsuarioService,
    private adminConcesionariaService: AdminConcesionariaService,
    private router: Router
  ) {
    this.filtrosForm = this.fb.group({
      tipoUsuario: [''],
      sinConcesionaria: [false], // Filtro del endpoint
      activo: [null], // Filtro en cliente
      concesionariaId: [null], // Filtro en cliente
      fechaAltaDesde: [''], // Filtro en cliente
      fechaAltaHasta: [''], // Filtro en cliente
      palabraClave: [''], // Filtro en cliente
      sortBy: ['fechaAlta'],
      sortOrder: ['DESC']
    });

    this.usuarioForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      telefono: [''],
      tipoUsuario: ['', Validators.required],
      concesionariaId: [null]
    });
  }

  ngOnInit(): void {
    this.cargarConcesionarias();
    this.cargarUsuarios();
    
    // Cargar usuarios cuando cambie el tipo de usuario (para mostrar/ocultar concesionaria)
    this.usuarioForm.get('tipoUsuario')?.valueChanges.subscribe(tipo => {
      const concesionariaControl = this.usuarioForm.get('concesionariaId');
      if (tipo === TipoUsuario.CONCESIONARIO) {
        concesionariaControl?.setValidators(null);
      } else {
        concesionariaControl?.clearValidators();
        concesionariaControl?.setValue(null);
      }
      concesionariaControl?.updateValueAndValidity();
    });
  }

  cargarConcesionarias(): void {
    this.adminConcesionariaService.listarConcesionarias().subscribe({
      next: (concesionarias) => this.concesionarias.set(concesionarias),
      error: (error) => console.error('Error al cargar concesionarias:', error)
    });
  }

  cargarUsuarios(): void {
    this.isLoading.set(true);
    const filtrosForm = this.filtrosForm.value;
    
    // Solo enviar los filtros que el endpoint acepta
    const filtrosEndpoint: { tipoUsuario?: string; sinConcesionaria?: boolean } = {};
    if (filtrosForm.tipoUsuario) {
      filtrosEndpoint.tipoUsuario = filtrosForm.tipoUsuario;
    }
    if (filtrosForm.sinConcesionaria) {
      filtrosEndpoint.sinConcesionaria = filtrosForm.sinConcesionaria;
    }

    this.adminUsuarioService.listarUsuarios(Object.keys(filtrosEndpoint).length > 0 ? filtrosEndpoint : undefined).subscribe({
      next: (usuarios: UsuarioAdmin[]) => {
        this.usuarios.set(usuarios);
        this.aplicarFiltros();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.isLoading.set(false);
        alert('Error al cargar los usuarios. Por favor, intenta nuevamente.');
      }
    });
  }

  aplicarFiltros(): void {
    let filtradas = [...this.usuarios()];
    const filtros = this.filtrosForm.value;

    // Filtrar por estado activo (en cliente)
    if (filtros.activo !== null && filtros.activo !== undefined) {
      filtradas = filtradas.filter(u => u.activo === filtros.activo);
    }

    // Filtrar por concesionaria (en cliente)
    if (filtros.concesionariaId) {
      filtradas = filtradas.filter(u => u.concesionariaId === filtros.concesionariaId);
    }

    // Filtrar por fecha de alta (en cliente)
    if (filtros.fechaAltaDesde) {
      const fechaDesde = new Date(filtros.fechaAltaDesde);
      filtradas = filtradas.filter(u => new Date(u.fechaAlta) >= fechaDesde);
    }
    if (filtros.fechaAltaHasta) {
      const fechaHasta = new Date(filtros.fechaAltaHasta);
      fechaHasta.setHours(23, 59, 59, 999); // Incluir todo el día
      filtradas = filtradas.filter(u => new Date(u.fechaAlta) <= fechaHasta);
    }

    // Filtrar por palabra clave (en cliente)
    if (filtros.palabraClave && filtros.palabraClave.trim() !== '') {
      const palabraClave = filtros.palabraClave.toLowerCase();
      filtradas = filtradas.filter(u => 
        u.nombre.toLowerCase().includes(palabraClave) ||
        u.apellido.toLowerCase().includes(palabraClave) ||
        u.email.toLowerCase().includes(palabraClave) ||
        (u.telefono && u.telefono.toLowerCase().includes(palabraClave))
      );
    }

    // Ordenar (en cliente)
    if (filtros.sortBy) {
      filtradas.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (filtros.sortBy) {
          case 'nombre':
            aValue = a.nombre.toLowerCase();
            bValue = b.nombre.toLowerCase();
            break;
          case 'email':
            aValue = a.email.toLowerCase();
            bValue = b.email.toLowerCase();
            break;
          case 'fechaAlta':
            aValue = new Date(a.fechaAlta).getTime();
            bValue = new Date(b.fechaAlta).getTime();
            break;
          default:
            aValue = new Date(a.fechaAlta).getTime();
            bValue = new Date(b.fechaAlta).getTime();
        }

        if (filtros.sortOrder === 'DESC') {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        } else {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        }
      });
    }

    this.usuariosFiltrados.set(filtradas);
    this.totalElements.set(filtradas.length);
    this.totalPages.set(Math.ceil(filtradas.length / this.pageSize()));
    this.aplicarPaginacion();
  }

  aplicarPaginacion(): void {
    const inicio = this.currentPage() * this.pageSize();
    const fin = inicio + this.pageSize();
    const paginadas = this.usuariosFiltrados().slice(inicio, fin);
    this.usuariosPaginados.set(paginadas);
  }

  buscar(): void {
    this.currentPage.set(0);
    this.cargarUsuarios(); // Esto recargará desde el servidor y aplicará filtros
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset({
      tipoUsuario: '',
      sinConcesionaria: false,
      activo: null,
      concesionariaId: null,
      fechaAltaDesde: '',
      fechaAltaHasta: '',
      palabraClave: '',
      sortBy: 'fechaAlta',
      sortOrder: 'DESC'
    });
    this.buscar();
  }

  toggleFiltros(): void {
    this.mostrarFiltros.update(val => !val);
  }

  irAPagina(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
      this.aplicarPaginacion();
    }
  }

  abrirModalCrear(): void {
    this.usuarioForm.reset({
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      telefono: '',
      tipoUsuario: '',
      concesionariaId: null
    });
    this.mostrarModalCrear.set(true);
  }

  crearUsuario(): void {
    if (this.usuarioForm.valid) {
      this.isLoading.set(true);
      const usuarioData: UsuarioAdminCreate = this.usuarioForm.value;
      
      this.adminUsuarioService.crearUsuario(usuarioData).subscribe({
        next: () => {
          alert('Usuario creado exitosamente');
          this.mostrarModalCrear.set(false);
          this.cargarUsuarios();
        },
        error: (error) => {
          console.error('Error al crear usuario:', error);
          alert('Error al crear el usuario. Por favor, intenta nuevamente.');
          this.isLoading.set(false);
        }
      });
    }
  }

  abrirModalEditar(usuario: UsuarioAdmin): void {
    this.usuarioSeleccionado.set(usuario);
    this.usuarioForm.patchValue({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      password: '', // No prellenar password
      telefono: usuario.telefono || '',
      tipoUsuario: usuario.tipoUsuario,
      concesionariaId: usuario.concesionariaId || null
    });
    // Remover validación de password para edición
    this.usuarioForm.get('password')?.clearValidators();
    this.usuarioForm.get('password')?.updateValueAndValidity();
    this.mostrarModalEditar.set(true);
  }

  editarUsuario(): void {
    if (this.usuarioForm.valid && this.usuarioSeleccionado()) {
      this.isLoading.set(true);
      const formValue = this.usuarioForm.value;
      const password = formValue.password;
      
      // Crear objeto de actualización sin password
      const usuarioData: UsuarioAdminUpdate = {
        nombre: formValue.nombre,
        apellido: formValue.apellido,
        email: formValue.email,
        telefono: formValue.telefono,
        tipoUsuario: formValue.tipoUsuario,
        concesionariaId: formValue.concesionariaId
      };
      
      // Si hay password, agregarlo al objeto (necesitaríamos una interfaz extendida o un endpoint separado)
      // Por ahora, solo actualizamos sin password si está vacío
      // Nota: Si el backend requiere un endpoint separado para cambiar password, deberíamos usarlo aquí
      
      this.adminUsuarioService.actualizarUsuario(this.usuarioSeleccionado()!.id, usuarioData).subscribe({
        next: () => {
          alert('Usuario actualizado exitosamente');
          this.mostrarModalEditar.set(false);
          this.usuarioSeleccionado.set(null);
          // Restaurar validación de password
          this.usuarioForm.get('password')?.setValidators([Validators.required]);
          this.cargarUsuarios();
        },
        error: (error) => {
          console.error('Error al actualizar usuario:', error);
          alert('Error al actualizar el usuario. Por favor, intenta nuevamente.');
          this.isLoading.set(false);
        }
      });
    }
  }

  confirmarEliminar(usuario: UsuarioAdmin): void {
    this.usuarioSeleccionado.set(usuario);
    this.mostrarModalEliminar.set(true);
  }

  eliminarUsuario(): void {
    const usuario = this.usuarioSeleccionado();
    if (!usuario) return;

    this.isLoading.set(true);
    this.adminUsuarioService.eliminarUsuario(usuario.id).subscribe({
      next: () => {
        alert('Usuario eliminado exitosamente');
        this.mostrarModalEliminar.set(false);
        this.usuarioSeleccionado.set(null);
        this.cargarUsuarios();
      },
      error: (error) => {
        console.error('Error al eliminar usuario:', error);
        alert('Error al eliminar el usuario. Por favor, intenta nuevamente.');
        this.isLoading.set(false);
      }
    });
  }

  confirmarActivar(usuario: UsuarioAdmin): void {
    this.usuarioSeleccionado.set(usuario);
    this.mostrarModalActivar.set(true);
  }

  activarUsuario(): void {
    const usuario = this.usuarioSeleccionado();
    if (!usuario) return;

    this.isLoading.set(true);
    this.adminUsuarioService.activarUsuario(usuario.id).subscribe({
      next: () => {
        alert('Usuario activado exitosamente');
        this.mostrarModalActivar.set(false);
        this.usuarioSeleccionado.set(null);
        this.cargarUsuarios();
      },
      error: (error) => {
        console.error('Error al activar usuario:', error);
        alert('Error al activar el usuario. Por favor, intenta nuevamente.');
        this.isLoading.set(false);
      }
    });
  }

  confirmarDesactivar(usuario: UsuarioAdmin): void {
    this.usuarioSeleccionado.set(usuario);
    this.mostrarModalDesactivar.set(true);
  }

  desactivarUsuario(): void {
    const usuario = this.usuarioSeleccionado();
    if (!usuario) return;

    this.isLoading.set(true);
    this.adminUsuarioService.desactivarUsuario(usuario.id).subscribe({
      next: () => {
        alert('Usuario desactivado exitosamente');
        this.mostrarModalDesactivar.set(false);
        this.usuarioSeleccionado.set(null);
        this.cargarUsuarios();
      },
      error: (error) => {
        console.error('Error al desactivar usuario:', error);
        alert('Error al desactivar el usuario. Por favor, intenta nuevamente.');
        this.isLoading.set(false);
      }
    });
  }

  verDetalle(usuario: UsuarioAdmin): void {
    this.usuarioSeleccionado.set(usuario);
    this.mostrarModalDetalle.set(true);
  }

  cerrarModales(): void {
    this.mostrarModalCrear.set(false);
    this.mostrarModalEditar.set(false);
    this.mostrarModalEliminar.set(false);
    this.mostrarModalActivar.set(false);
    this.mostrarModalDesactivar.set(false);
    this.mostrarModalDetalle.set(false);
    this.usuarioSeleccionado.set(null);
    // Restaurar validación de password
    this.usuarioForm.get('password')?.setValidators([Validators.required]);
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  exportarUsuarios(formato: 'excel' | 'pdf'): void {
    const filtros: UsuarioAdminFiltros = this.filtrosForm.value;
    
    // Limpiar valores vacíos
    Object.keys(filtros).forEach(key => {
      if (filtros[key as keyof UsuarioAdminFiltros] === '' || filtros[key as keyof UsuarioAdminFiltros] === null) {
        delete filtros[key as keyof UsuarioAdminFiltros];
      }
    });

    this.isLoading.set(true);
    this.adminUsuarioService.exportarUsuarios(formato, filtros).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `usuarios.${formato === 'excel' ? 'xlsx' : 'pdf'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.isLoading.set(false);
        alert(`Usuarios exportados exitosamente en formato ${formato.toUpperCase()}`);
      },
      error: (error) => {
        console.error('Error al exportar usuarios:', error);
        alert('Error al exportar los usuarios. Por favor, intenta nuevamente.');
        this.isLoading.set(false);
      }
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.usuarioForm.get(fieldName);
    
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return 'Este campo es requerido';
      }
      if (field.errors['email']) {
        return 'El formato del email no es válido';
      }
    }
    
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.usuarioForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }
}

