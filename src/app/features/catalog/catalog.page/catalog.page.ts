import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { ProductStore, Product } from '../../../services/product-store';
import { ProductGrid } from '../product-grid/product-grid';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink, Header, Footer, ProductGrid],
  templateUrl: './catalog.page.html',
})
export class CatalogPage implements OnInit {
  private store = inject(ProductStore);

  products: Product[] = [];
  categories: string[] = [];
  loading = false; // ici, inutile mais on garde la structure
  error: any = null;

  ngOnInit(): void {
    try {
      this.loading = true;
      this.products = this.store.getAll();
      this.categories = this.store.getCategories();
      this.loading = false;
    } catch (e) {
      this.error = e;
      this.loading = false;
    }
    
  }

  reload() {
    this.ngOnInit();
  }
}
