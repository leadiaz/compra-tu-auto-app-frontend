import { Component, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  searchQuery = signal('');
  searchEvent = output<string>();

  onSearch(): void {
    const query = this.searchQuery().trim();
    if (query) {
      this.searchEvent.emit(query);
    }
  }

  onInputChange(value: string): void {
    this.searchQuery.set(value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.searchEvent.emit('');
  }
}

