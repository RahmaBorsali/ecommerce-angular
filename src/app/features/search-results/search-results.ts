import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

// 🧰 Adapte ces imports à ton projet
import { ProductStore, Product } from '../../services/product-store';
import { Header } from "../../shared/header/header";
import { Footer } from "../../shared/footer/footer";

@Component({
  standalone: true,
  selector: 'app-search-results',
  imports: [CommonModule, RouterLink, Header, Footer],
  templateUrl: './search-results.html',
})
export class SearchResults implements OnInit {
  private route = inject(ActivatedRoute);
  private store = inject(ProductStore);

  q = '';
  products: Product[] = [];
  categories: string[] = [];

  allProducts: Product[] = [];

  ngOnInit(): void {
    this.allProducts = this.store.getAll?.() ?? [];
    this.route.queryParamMap.subscribe((map) => {
      this.q = (map.get('q') || '').trim().toLowerCase();
      this.applySearch();
    });
  }

  private applySearch() {
    if (!this.q) {
      this.products = [];
      this.categories = [];
      return;
    }

    const q = this.q;

    // Produits qui matchent (titre/description)
    this.products = this.allProducts.filter((p) =>
      (p.title || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    );

    // Catégories candidates (d’après les produits)
    const unique = new Set(
      this.allProducts
        .map((p) => (p.category || '').toLowerCase())
        .filter(Boolean)
    );

    this.categories = Array.from(unique).filter((c) => c.includes(q));
  }
}
