import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

import { CartService } from '../../../services/cart.service';
import { ProductService, Product } from '../../../services/product.service';

@Component({
  selector: 'app-featured-products',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './featured-products.html',
  styleUrl: './featured-products.scss',
})
export class FeaturedProducts implements OnInit {
  private cartSvc = inject(CartService);
  private productSvc = inject(ProductService);

  products: Product[] = [];
  loading = false;
  error = '';

  ngOnInit(): void {
    this.loading = true;
    this.error = '';

    this.productSvc.getProducts({ featured: true }).subscribe({
      next: (res) => {
        // on peut limiter à 8 produits vedettes
        this.products = (res || []).slice(0, 8);
      },
      error: () => {
        this.error = 'Impossible de charger les produits vedettes.';
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  // récupère l’image principale
  getImage(product: Product): string {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return 'assets/placeholder-product.jpg'; // image fallback si tu veux
  }

  // rating (optionnel)
  getRating(product: Product): number {
    return product.rating ?? 4.5; // par défaut une note sympa
  }

  addToCart(product: Product) {
    this.cartSvc.addToCart({
      id: product._id,                       // 👉 Mongo ID (string)
      name: product.name,
      price: product.promoPrice ?? product.price,
      image: this.getImage(product),
      quantity: 1,
    });

    Swal.fire({
      title: 'Ajouté au panier 🛒',
      text: `${product.name} a été ajouté avec succès.`,
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#2563eb',
      timer: 5000,
      timerProgressBar: true,
    });
  }

  starArray(rating: number): number[] {
    const full = Math.floor(rating);
    return Array.from({ length: 5 }, (_, i) => (i < full ? 1 : 0));
  }
}
