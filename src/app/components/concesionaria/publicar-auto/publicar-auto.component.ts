import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConcesionariaOfertaService } from '../../../services/concesionaria-oferta.service';
import { ConcesionariaService } from '../../../services/concesionaria.service';
import { AdminAutoService } from '../../../services/admin-auto.service';
import { AutoBase } from '../../../models/auto-base.model';
import { OfertaCreate } from '../../../models/oferta.model';

@Component({
  selector: 'app-publicar-auto',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './publicar-auto.component.html',
  styleUrl: './publicar-auto.component.css'
})
export class PublicarAutoComponent implements OnInit {
  ofertaForm: FormGroup;
  isLoading = signal(false);
  submitted = signal(false);
  
  autosBase = signal<AutoBase[]>([]);
  autosFiltrados = signal<AutoBase[]>([]);
  filtroBusqueda: string = '';
  concesionariaId = signal<number | null>(null);

  constructor(
    private fb: FormBuilder,
    private concesionariaOfertaService: ConcesionariaOfertaService,
    private concesionariaService: ConcesionariaService,
    private adminAutoService: AdminAutoService,
    private router: Router
  ) {
    this.ofertaForm = this.fb.group({
      autoId: ['', Validators.required],
      stock: ['', [Validators.required, Validators.min(0)]],
      precioActual: ['', [Validators.required, Validators.min(0.01)]],
      moneda: ['ARS', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarConcesionaria();
    this.cargarAutosBase();
  }

  cargarConcesionaria(): void {
    this.concesionariaService.obtenerMiConcesionaria().subscribe({
      next: (concesionaria) => {
        this.concesionariaId.set(concesionaria.id);
      },
      error: (error) => {
        console.error('Error al cargar concesionaria:', error);
        // alert('Error al cargar la información de la concesionaria. Por favor, intenta nuevamente.');
      }
    });
  }

  cargarAutosBase(): void {
    this.isLoading.set(true);
    this.adminAutoService.listarAutosBase().subscribe({
      next: (autos) => {
        this.autosBase.set(autos);
        this.autosFiltrados.set(autos);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar autos:', error);
        alert('Error al cargar los autos disponibles. Por favor, intenta nuevamente.');
        this.isLoading.set(false);
      }
    });
  }

  filtrarAutos(): void {
    const busqueda = this.filtroBusqueda.toLowerCase();
    if (!busqueda) {
      this.autosFiltrados.set(this.autosBase());
      return;
    }
    
    const filtrados = this.autosBase().filter(auto => 
      auto.marca.toLowerCase().includes(busqueda) ||
      auto.modelo.toLowerCase().includes(busqueda) ||
      auto.anioModelo.toString().includes(busqueda)
    );
    this.autosFiltrados.set(filtrados);
  }

  obtenerAutoSeleccionado(): AutoBase | undefined {
    const autoId = this.ofertaForm.get('autoId')?.value;
    if (!autoId) return undefined;
    return this.autosBase().find(a => a.id === parseInt(autoId));
  }

  onSubmit(): void {
    this.submitted.set(true);
    
    if (this.ofertaForm.valid) {
      // const concesionariaIdValue = this.concesionariaId();
      // if (!concesionariaIdValue) {
      //   alert('No se pudo obtener la información de la concesionaria. Por favor, intenta nuevamente.');
      //   return;
      // }

      this.isLoading.set(true);
      
      const ofertaData: OfertaCreate = {
        autoId: parseInt(this.ofertaForm.value.autoId),
        // concesionariaId: concesionariaIdValue,
        stock: parseInt(this.ofertaForm.value.stock),
        precioActual: parseFloat(this.ofertaForm.value.precioActual),
        moneda: this.ofertaForm.value.moneda
      };

      this.concesionariaOfertaService.crearOferta(ofertaData).subscribe({
        next: () => {
          this.isLoading.set(false);
          alert('Oferta creada exitosamente');
          this.router.navigate(['/dashboard/mis-ofertas']);
        },
        error: (error) => {
          console.error('Error al crear oferta:', error);
          if (error.status === 409) {
            alert('Ya existe una oferta para este auto. Puedes editarla desde "Mis Ofertas".');
          } else if (error.status === 422) {
            alert(error.error?.message || 'No puedes crear ofertas. Verifica que tu concesionaria esté activa y asociada a tu usuario.');
          } else {
            alert(error.error?.message || 'Error al crear la oferta. Por favor, intenta nuevamente.');
          }
          this.isLoading.set(false);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.ofertaForm.controls).forEach(key => {
      const control = this.ofertaForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.ofertaForm.get(fieldName);
    
    if (field?.errors && (field.touched || this.submitted())) {
      if (field.errors['required']) {
        return 'Este campo es requerido';
      }
      if (field.errors['min']) {
        return `El valor mínimo es ${field.errors['min'].min}`;
      }
    }
    
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.ofertaForm.get(fieldName);
    return !!(field?.invalid && (field.touched || this.submitted()));
  }

  cancelar(): void {
    if (confirm('¿Estás seguro de cancelar? Los datos no guardados se perderán.')) {
      this.router.navigate(['/dashboard/mis-ofertas']);
    }
  }
}

