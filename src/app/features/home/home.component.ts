import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductStore, Product } from '../../services/product-store';
@Component({
  selector: 'app-home',
  template: `
    <app-header></app-header>
    <app-hero-slider></app-hero-slider>
    <app-categories-grid></app-categories-grid>
    <app-featured-products></app-featured-products>
    <app-footer></app-footer>

  ` ,
  standalone : false
})
export class HomeComponent implements OnInit{
  private route = inject(ActivatedRoute);
  private store = inject(ProductStore);

  allProducts: Product[] = [];
  q = signal('');
  category = signal('');

  // liste filtrée pour la section “Résultats”
  results = computed(() => {
    const query = this.q().toLowerCase();
    const cat = this.category().toLowerCase();

    return this.allProducts.filter(p => {
      const inCat = !cat || (p.category || '').toLowerCase().includes(cat);
      const inText = !query
        || (p.title || '').toLowerCase().includes(query)
        || (p.description || '').toLowerCase().includes(query);
      return inCat && inText;
    });
  });

  ngOnInit(): void {
    this.allProducts = this.store.getAll(); // adapte si Observable
    this.route.queryParamMap.subscribe(m => {
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
