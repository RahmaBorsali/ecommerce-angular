// src/app/features/catalog/catalog.page/catalog.page.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { ProductGrid } from '../product-grid/product-grid';
import { ProductService, Product } from '../../../services/product.service';
import { CategoryService, Category } from '../../../services/category.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink, Header, Footer, ProductGrid],
  templateUrl: './catalog.page.html',
})
export class CatalogPage implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);

  products: Product[] = [];
  categories: string[] = [];      // on va stocker les slugs des catégories
  selectedCategory = '';
  loading = false;
  error: any = null;

  ngOnInit(): void {
    this.loading = true;
    this.error = null;

    // 🔹 Récupérer category depuis l'URL ?category=pc-gamer
    this.route.queryParamMap.subscribe((p) => {
      this.selectedCategory = p.get('category') ?? '';
    });

    // 🔹 Charger les catégories depuis le backend
    this.categoryService.getCategories().subscribe({
      next: (cats: Category[]) => {
        this.categories = cats
          .filter((c) => c.isActive !== false)
          .map((c) => c.slug); // on passe les slugs au grid
      },
      error: (err) => {
        console.error('Erreur chargement catégories', err);
      },
    });

    // 🔹 Charger les produits depuis le backend
    this.productService.getProducts().subscribe({
      next: (prods: Product[]) => {
        this.products = prods;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement produits', err);
        this.error = err;
        this.loading = false;
      },
    });

    window.scrollTo(0, 0);
  }

  reload() {
    this.ngOnInit();
  }
}
