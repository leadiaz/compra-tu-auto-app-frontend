import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConcesionariaAutoService } from '../../../services/concesionaria-auto.service';
import { AutoService } from '../../../services/auto.service';
import { Auto, TipoCombustible, TipoTransmision } from '../../../models/auto.model';

@Component({
  selector: 'app-publicar-auto',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './publicar-auto.component.html',
  styleUrl: './publicar-auto.component.css'
})
export class PublicarAutoComponent implements OnInit {
  autoForm: FormGroup;
  isLoading = signal(false);
  submitted = signal(false);
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
    private router: Router
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
    this.cargarMarcas();
    
    // Cargar modelos cuando cambie la marca
    this.autoForm.get('marca')?.valueChanges.subscribe(marca => {
      if (marca) {
        this.cargarModelos(marca);
      } else {
        this.modelos.set([]);
        this.autoForm.patchValue({ modelo: '' });
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
        this.autoForm.patchValue({ modelo: '' });
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

  eliminarImagen(index: number): void {
    this.imagenesSeleccionadas.update(imgs => imgs.filter((_, i) => i !== index));
    this.previewImagenes.update(prev => prev.filter((_, i) => i !== index));
  }

  onSubmit(): void {
    this.submitted.set(true);
    
    if (this.autoForm.valid) {
      this.isLoading.set(true);
      
      const autoData: Partial<Auto> = {
        ...this.autoForm.value,
        año: parseInt(this.autoForm.value.año),
        precio: parseFloat(this.autoForm.value.precio),
        kilometraje: parseInt(this.autoForm.value.kilometraje)
      };

      // Primero crear el auto
      this.concesionariaAutoService.crearAuto(autoData).subscribe({
        next: (auto) => {
          // Si hay imágenes, subirlas
          if (this.imagenesSeleccionadas().length > 0) {
            this.subirImagenes(auto.id);
          } else {
            this.isLoading.set(false);
            alert('Auto publicado exitosamente');
            this.router.navigate(['/dashboard/mis-autos']);
          }
        },
        error: (error) => {
          console.error('Error al crear auto:', error);
          alert('Error al publicar el auto. Por favor, intenta nuevamente.');
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
      alert('Auto publicado exitosamente');
      this.router.navigate(['/dashboard/mis-autos']);
      return;
    }

    imagenes.forEach((imagen, index) => {
      this.concesionariaAutoService.subirImagen(autoId, imagen).subscribe({
        next: () => {
          subidas++;
          if (subidas === total) {
            this.isLoading.set(false);
            alert('Auto publicado exitosamente');
            this.router.navigate(['/dashboard/mis-autos']);
          }
        },
        error: (error) => {
          console.error(`Error al subir imagen ${index + 1}:`, error);
          subidas++;
          if (subidas === total) {
            // Aunque haya errores, el auto ya está creado
            alert('Auto publicado, pero algunas imágenes no se pudieron subir.');
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

