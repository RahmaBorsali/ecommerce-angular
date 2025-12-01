import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'app-home',
  template: `
    <app-header></app-header>
    <app-hero-slider></app-hero-slider>
    <app-categories-grid></app-categories-grid>
    <app-featured-products></app-featured-products>
    <app-footer></app-footer>
  `,
  standalone: false, // tu peux laisser comme ça si tu utilises un module
})
export class HomeComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);

  allProducts: Product[] = [];

  // recherche & catégorie venant de l'URL
  q = signal('');
  category = signal('');

  // liste filtrée (si tu veux l’utiliser sur la home ou plus tard)
  results = computed(() => {
    const query = this.q().toLowerCase();
    const cat = this.category().toLowerCase();

    return this.allProducts.filter((p) => {
      // cat peut venir de string ou d’objet { name, slug }
      const catStr =
        typeof p.category === 'string'
          ? p.category.toLowerCase()
          : (p.category?.slug || p.category?.name || '').toLowerCase();

      const inCat = !cat || catStr.includes(cat);

      const name = (p.name || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();

      const inText =
        !query ||
        name.includes(query) ||
        desc.includes(query);

      return inCat && inText;
    });
  });

  ngOnInit(): void {
    // 1) charger les produits depuis le backend
    this.productService.getProducts().subscribe({
      next: (prods) => {
        this.allProducts = prods;
      },
      error: (err) => {
        console.error('Erreur chargement produits home:', err);
        this.allProducts = [];
      },
    });

    // 2) écouter les query params ?q=...&category=...
    this.route.queryParamMap.subscribe((m) => {
      this.q.set((m.get('q') || '').trim());
      this.category.set((m.get('category') || '').trim());
    });
  }

  // utile pour “effacer” la recherche depuis Home
  clearSearch() {
    history.replaceState({}, '', location.pathname);
    this.q.set('');
    this.category.set('');
  }
}
