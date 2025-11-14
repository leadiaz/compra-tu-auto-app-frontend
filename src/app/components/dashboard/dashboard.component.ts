import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
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
}
