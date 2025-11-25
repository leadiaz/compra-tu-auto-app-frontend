export interface MenuItem {
  id: number;
  label: string;
  icon: string;
  route: string;
  orden: number;
}

export interface MenuResponse {
  items: MenuItem[];
}

