import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NavbarComponent } from './navbar/navbar.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, NavbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  // Ejemplo de estado con signals
  userName = signal('Usuario');
  notifications = signal<number>(3);

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName.set(`${user.nombre} ${user.apellido}`);
    }
  }

  clearNotifications() {
    this.notifications.set(0);
  }

  onSearch(query: string): void {
    console.log('Búsqueda:', query);
    // Aquí puedes implementar la lógica de búsqueda
  }
}
