import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NavbarComponent } from './navbar/navbar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, NavbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  // Ejemplo de estado con signals
  userName = signal('Usuario');
  notifications = signal<number>(3);

  clearNotifications() {
    this.notifications.set(0);
  }

  onSearch(query: string): void {
    console.log('Búsqueda:', query);
    // Aquí puedes implementar la lógica de búsqueda
  }
}
