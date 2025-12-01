// src/app/features/catalog/product-grid/product-grid.ts
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './product-grid.html',
})
export class ProductGrid implements OnChanges {
  @Input() products: Product[] = [];
  @Input() categories: string[] = [];
  @Input() initialCategory: string = '';

  // état filtres/tri
  selectedCategory = '';
  priceMax = 2000;
  maxPriceCeil = 2000;
  sortBy = '';
  searchQuery = '';

  // pagination
  productsPerPage = 12;
  currentPage = 1;

  filtered: Product[] = [];
  pageItems: Product[] = [];

  constructor(private cart: CartService) {}

  ngOnChanges(changes: SimpleChanges): void {
    // Quand la liste de produits change, on recalcule le prix max
    if (changes['products']?.currentValue) {
      const maxp = Math.max(
        ...this.products.map((p) => p.promoPrice ?? p.price ?? 0),
        0
      );
      this.maxPriceCeil = Math.ceil(maxp || 2000);
      this.priceMax = this.maxPriceCeil;
    }

    // Catégorie initiale venant du parent (URL)
    if (changes['initialCategory']) {
      this.selectedCategory = this.initialCategory || '';
    }

    this.applyAll();
  }

  applyAll() {
    this.filtered = this.computeFiltered();
    this.currentPage = 1;
    this.slicePage();
  }

  private computeFiltered(): Product[] {
    let arr = [...this.products];

    // 🔹 Filtre par catégorie (string ou objet {slug})
    if (this.selectedCategory) {
      arr = arr.filter((p) => {
        const catSlug =
          typeof p.category === 'string'
            ? p.category
            : p.category?.slug;
        return catSlug === this.selectedCategory;
      });
    }

    // 🔹 Recherche sur name + description
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      arr = arr.filter((p) =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    }

    // 🔹 Filtre prix (promoPrice prioritaire)
    arr = arr.filter((p) => {
      const price = p.promoPrice ?? p.price ?? 0;
      return price >= 0 && price <= this.priceMax;
    });

    // 🔹 Tri
    if (this.sortBy === 'price-asc') {
      arr.sort(
        (a, b) =>
          (a.promoPrice ?? a.price ?? 0) -
          (b.promoPrice ?? b.price ?? 0)
      );
    }
    if (this.sortBy === 'price-desc') {
      arr.sort(
        (a, b) =>
          (b.promoPrice ?? b.price ?? 0) -
          (a.promoPrice ?? a.price ?? 0)
      );
    }

    return arr;
  }

  slicePage() {
    const start = (this.currentPage - 1) * this.productsPerPage;
    const end = start + this.productsPerPage;
    this.pageItems = this.filtered.slice(start, end);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.productsPerPage));
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goPage(n: number) {
    this.currentPage = n;
    this.slicePage();
  }

  addToCart(p: Product) {
    const price = p.promoPrice ?? p.price ?? 0;
    const image = p.images?.[0] ?? '';

    this.cart.addToCart({
      id: p._id,          
      name: p.name,
      price,
      image,
      quantity: 1,
    });

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Ajouté au panier 🛒',
      timer: 1200,
      showConfirmButton: false,
    });
  }
}
