// src/app/features/catalog/product-grid/product-grid.ts
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../services/product-store';
import { CartService } from '../../../services/cart.service';
import Swal from 'sweetalert2';
import { Header } from "../../../shared/header/header";
import { Footer } from "../../../shared/footer/footer";

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, Header, Footer],
  templateUrl: './product-grid.html',
})
export class ProductGrid implements OnChanges {
  @Input() products: Product[] = [];
  @Input() categories: string[] = [];

  // 👇👇 AJOUTER CETTE LIGNE
  @Input() initialCategory: string = '';

  // état filtres/tri
  selectedCategory = '';
  priceMax = 2000;
  maxPriceCeil = 2000;
  minRating = 0;
  sortBy = '';
  searchQuery = '';

  // pagination
  productsPerPage = 12;
  currentPage = 1;

  filtered: Product[] = [];
  pageItems: Product[] = [];

  constructor(private cart: CartService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['products']?.currentValue) {
      const maxp = Math.max(...this.products.map(p => p.price || 0), 0);
      this.maxPriceCeil = Math.ceil(maxp || 2000);
      this.priceMax = this.maxPriceCeil;
    }

    // 👇👇 Appliquer la catégorie initiale quand elle arrive du parent
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

    if (this.selectedCategory) {
      arr = arr.filter(p => p.category === this.selectedCategory);
    }

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      arr = arr.filter(p =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    }

    arr = arr.filter(p => p.price >= 0 && p.price <= this.priceMax);

    if (this.minRating > 0) {
      arr = arr.filter(p => (p.rating || 0) >= this.minRating);
    }

    if (this.sortBy === 'price-asc') arr.sort((a, b) => a.price - b.price);
    if (this.sortBy === 'price-desc') arr.sort((a, b) => b.price - a.price);
    if (this.sortBy === 'rating') arr.sort((a, b) => (b.rating || 0) - (a.rating || 0));

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
    this.cart.addToCart({ id: p.id, name: p.title, price: p.price, image: p.image, quantity: 1 });
    Swal.fire({ toast:true, position:'top-end', icon:'success', title:'Ajouté au panier 🛒', timer:1200, showConfirmButton:false });
  }

  rateRounded(p: Product): number { return Math.floor(p?.rating ?? 0); }
  rateRaw(p: Product): number { return p?.rating ?? 0; }
}
