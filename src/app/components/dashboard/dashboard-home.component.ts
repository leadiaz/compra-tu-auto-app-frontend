import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TipoUsuario } from '../../models/auth.model';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-home">
      <header class="dashboard-header">
        <h1>Bienvenido, {{ userName() }}</h1>
        <div class="header-actions">
          <button class="btn" (click)="clearNotifications()">
            Limpiar notificaciones
          </button>
          <div class="badge" [attr.data-badge]="notifications()">🔔</div>
        </div>
      </header>

      <section class="grid">
        <article class="card">
          <h2>Resumen</h2>
          <p>Este es tu panel principal. Aquí verás información clave de Compra Tu Auto.</p>
        </article>

        @if (esComprador()) {
          <article class="card">
            <h2>Accesos Rápidos</h2>
            <div class="quick-links">
              <a routerLink="/dashboard/ofertas" class="quick-link">Buscar Autos</a>
              <a routerLink="/dashboard/favoritos" class="quick-link">Mis Favoritos</a>
              <a routerLink="/dashboard/mis-compras" class="quick-link">Mis Compras</a>
            </div>
          </article>
        }

        <article class="card">
          <h2>Actividad reciente</h2>
          <p>Registros y eventos importantes aparecerán aquí.</p>
        </article>
      </section>
    </div>
  `,
  styleUrl: './dashboard.component.css'
})
export class DashboardHomeComponent implements OnInit {
  userName = signal('Usuario');
  notifications = signal<number>(3);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName.set(`${user.nombre} ${user.apellido}`);
    }
  }

  esComprador(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.tipoUsuario === TipoUsuario.COMPRADOR;
  }

  clearNotifications() {
    this.notifications.set(0);
  }
}

