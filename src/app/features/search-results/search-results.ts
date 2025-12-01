import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import { ProductService, Product } from '../../services/product.service';

@Component({
  standalone: true,
  selector: 'app-search-results',
  imports: [CommonModule, RouterLink, Header, Footer],
  templateUrl: './search-results.html',
})
export class SearchResults implements OnInit {
  private route = inject(ActivatedRoute);
  private productSvc = inject(ProductService);

  q = '';
  products: Product[] = [];
  categories: string[] = [];

  loading = false;
  error = '';

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((map) => {
      this.q = (map.get('q') || '').trim();
      this.search();
    });
  }

  private search() {
    if (!this.q) {
      this.products = [];
      this.categories = [];
      this.loading = false;
      this.error = '';
      return;
    }

    this.loading = true;
    this.error = '';

    this.productSvc.getProducts({ search: this.q }).subscribe({
      next: (list) => {
        this.products = list || [];

        // Construire la liste de catégories à partir des produits retournés
        const cats = this.products
          .map((p) => {
            if (typeof p.category === 'string') return p.category;
            if (p.category && typeof p.category === 'object') {
              return p.category.slug || p.category.name || '';
            }
            return '';
          })
          .filter(Boolean)
          .map((c) => c.toLowerCase());

        this.categories = Array.from(new Set(cats));
      },
      error: () => {
        this.error = 'Erreur lors de la recherche.';
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  // ----- Helpers pour le template -----

  getCategoryLabel(p: Product): string {
    const cat = p.category;
    if (!cat) return '';
    if (typeof cat === 'string') return cat;
    return cat.name || cat.slug || '';
  }

  getImage(p: Product): string {
    if (p.images && p.images.length > 0) {
      return p.images[0];
    }
    return 'assets/placeholder-product.jpg';
  }

  getDisplayPrice(p: Product): number {
    return p.promoPrice ?? p.price;
  }
}
