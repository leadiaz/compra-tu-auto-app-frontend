import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MenuService } from '../../../services/menu.service';
import { MenuItem } from '../../../models/menu.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  menuItems = signal<MenuItem[]>([]);
  isLoading = signal(true);

  constructor(
    private router: Router,
    private menuService: MenuService
  ) {
    this.router.events.subscribe(() => {
      this.updateActiveRoute();
    });
  }

  ngOnInit(): void {
    this.loadMenu();
  }

  private loadMenu(): void {
    this.isLoading.set(true);
    this.menuService.getMenu().subscribe({
      next: (response) => {
        this.menuItems.set(response.items);
        this.isLoading.set(false);
        this.updateActiveRoute();
      },
      error: (error) => {
        console.error('Error al cargar el menú:', error);
        this.isLoading.set(false);
      }
    });
  }

  private updateActiveRoute(): void {
    const currentRoute = this.router.url;
    this.menuItems.update(items => 
      items.map(item => ({
        ...item,
        active: currentRoute === item.route || currentRoute.startsWith(item.route + '/')
      }))
    );
  }
}

