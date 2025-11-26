import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ConcesionariaAutoService } from '../../../services/concesionaria-auto.service';
import { AutoService } from '../../../services/auto.service';
import { Auto, TipoCombustible, TipoTransmision } from '../../../models/auto.model';

@Component({
  selector: 'app-editar-auto',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './editar-auto.component.html',
  styleUrl: './editar-auto.component.css'
})
export class EditarAutoComponent implements OnInit {
  autoForm: FormGroup;
  isLoading = signal(false);
  cargandoAuto = signal(true);
  submitted = signal(false);
  autoId: number | null = null;
  imagenesExistentes = signal<string[]>([]);
  imagenesSeleccionadas = signal<File[]>([]);
  previewImagenes = signal<string[]>([]);
  
  marcas = signal<string[]>([]);
  modelos = signal<string[]>([]);
  tiposCombustible = Object.values(TipoCombustible);
  tiposTransmision = Object.values(TipoTransmision);

  constructor(
    private fb: FormBuilder,
    private concesionariaAutoService: ConcesionariaAutoService,
    private autoService: AutoService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.autoForm = this.fb.group({
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      año: ['', [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
      precio: ['', [Validators.required, Validators.min(0)]],
      kilometraje: ['', [Validators.required, Validators.min(0)]],
      combustible: ['', Validators.required],
      transmision: ['', Validators.required],
      color: ['', Validators.required],
      descripcion: ['', Validators.required],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.autoId = +params['id'];
      if (this.autoId) {
        this.cargarAuto();
      }
    });
    
    this.cargarMarcas();
    
    // Cargar modelos cuando cambie la marca
    this.autoForm.get('marca')?.valueChanges.subscribe(marca => {
      if (marca) {
        this.cargarModelos(marca);
      }
    });
  }

  cargarAuto(): void {
    if (!this.autoId) return;
    
    this.cargandoAuto.set(true);
    this.concesionariaAutoService.obtenerDetalleAuto(this.autoId).subscribe({
      next: (auto) => {
        this.autoForm.patchValue({
          marca: auto.marca,
          modelo: auto.modelo,
          año: auto.año,
          precio: auto.precio,
          kilometraje: auto.kilometraje,
          combustible: auto.combustible,
          transmision: auto.transmision,
          color: auto.color,
          descripcion: auto.descripcion,
          activo: auto.activo ?? true
        });
        
        if (auto.imagenes && auto.imagenes.length > 0) {
          this.imagenesExistentes.set(auto.imagenes);
        }
        
        // Cargar modelos de la marca seleccionada
        this.cargarModelos(auto.marca);
        this.cargandoAuto.set(false);
      },
      error: (error) => {
        console.error('Error al cargar auto:', error);
        alert('Error al cargar el auto. Por favor, intenta nuevamente.');
        this.router.navigate(['/dashboard/mis-autos']);
      }
    });
  }

  cargarMarcas(): void {
    this.autoService.obtenerMarcas().subscribe({
      next: (marcas) => this.marcas.set(marcas),
      error: (error) => console.error('Error al cargar marcas:', error)
    });
  }

  cargarModelos(marca: string): void {
    this.autoService.obtenerModelosPorMarca(marca).subscribe({
      next: (modelos) => {
        this.modelos.set(modelos);
      },
      error: (error) => console.error('Error al cargar modelos:', error)
    });
  }

  onImagenesSeleccionadas(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      this.imagenesSeleccionadas.set([...this.imagenesSeleccionadas(), ...files]);
      
      // Crear previews
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const preview = e.target?.result as string;
          this.previewImagenes.update(prev => [...prev, preview]);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  eliminarImagenExistente(index: number): void {
    // En una implementación real, aquí se llamaría al servicio para eliminar la imagen
    // Por ahora solo la removemos del array local
    this.imagenesExistentes.update(imgs => imgs.filter((_, i) => i !== index));
  }

  eliminarImagenNueva(index: number): void {
    this.imagenesSeleccionadas.update(imgs => imgs.filter((_, i) => i !== index));
    this.previewImagenes.update(prev => prev.filter((_, i) => i !== index));
  }

  onSubmit(): void {
    this.submitted.set(true);
    
    if (this.autoForm.valid && this.autoId) {
      this.isLoading.set(true);
      
      const autoData: Partial<Auto> = {
        ...this.autoForm.value,
        año: parseInt(this.autoForm.value.año),
        precio: parseFloat(this.autoForm.value.precio),
        kilometraje: parseInt(this.autoForm.value.kilometraje)
      };

      // Actualizar el auto
      this.concesionariaAutoService.actualizarAuto(this.autoId, autoData).subscribe({
        next: (auto) => {
          // Si hay nuevas imágenes, subirlas
          if (this.imagenesSeleccionadas().length > 0) {
            this.subirImagenes(this.autoId!);
          } else {
            this.isLoading.set(false);
            alert('Auto actualizado exitosamente');
            this.router.navigate(['/dashboard/mis-autos']);
          }
        },
        error: (error) => {
          console.error('Error al actualizar auto:', error);
          alert('Error al actualizar el auto. Por favor, intenta nuevamente.');
          this.isLoading.set(false);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private subirImagenes(autoId: number): void {
    const imagenes = this.imagenesSeleccionadas();
    let subidas = 0;
    const total = imagenes.length;

    if (total === 0) {
      this.isLoading.set(false);
      alert('Auto actualizado exitosamente');
      this.router.navigate(['/dashboard/mis-autos']);
      return;
    }

    imagenes.forEach((imagen, index) => {
      this.concesionariaAutoService.subirImagen(autoId, imagen).subscribe({
        next: () => {
          subidas++;
          if (subidas === total) {
            this.isLoading.set(false);
            alert('Auto actualizado exitosamente');
            this.router.navigate(['/dashboard/mis-autos']);
          }
        },
        error: (error) => {
          console.error(`Error al subir imagen ${index + 1}:`, error);
          subidas++;
          if (subidas === total) {
            alert('Auto actualizado, pero algunas imágenes no se pudieron subir.');
            this.router.navigate(['/dashboard/mis-autos']);
          }
        }
      });
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.autoForm.controls).forEach(key => {
      const control = this.autoForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.autoForm.get(fieldName);
    
    if (field?.errors && (field.touched || this.submitted())) {
      if (field.errors['required']) {
        return 'Este campo es requerido';
      }
      if (field.errors['min']) {
        return `El valor mínimo es ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `El valor máximo es ${field.errors['max'].max}`;
      }
    }
    
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.autoForm.get(fieldName);
    return !!(field?.invalid && (field.touched || this.submitted()));
  }

  cancelar(): void {
    if (confirm('¿Estás seguro de cancelar? Los datos no guardados se perderán.')) {
      this.router.navigate(['/dashboard/mis-autos']);
    }
  }

  getAnioMaximo(): number {
    return new Date().getFullYear() + 1;
  }
}

