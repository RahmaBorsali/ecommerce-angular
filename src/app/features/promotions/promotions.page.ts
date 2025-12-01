import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import { CartService } from '../../services/cart.service';
import Swal from 'sweetalert2';
import { ProductService, Product } from '../../services/product.service';

type ProductPromo = {
  id: string;               // _id Mongo pour routerLink et addToCart
  title: string;            // name du produit
  price: number;            // prix promo (affiché en gros)
  oldPrice?: number;        // ancien prix barré
  discountPercent?: number; // % réduction
  rating?: number;          // averageRating éventuel
  image: string;            // 1ère image
};

@Component({
  standalone: true,
  selector: 'app-promotions',
  imports: [CommonModule, RouterLink, Header, Footer],
  templateUrl: './promotions.page.html',
  styleUrl: './promotions.page.scss',
})
export class PromotionsPage implements OnInit {
  Math = Math; // pour le template

  private title = inject(Title);
  private meta = inject(Meta);
  private cart = inject(CartService);
  private productService = inject(ProductService);

  loading = true;
  error: any = null;
  promos: ProductPromo[] = [];

  ngOnInit(): void {
    // 🔹 SEO
    this.title.setTitle('Promotions - ShopNow');
    this.meta.updateTag({
      name: 'description',
      content: 'Découvrez nos meilleures offres promotionnelles',
    });
    this.meta.updateTag({ property: 'og:title', content: 'Promotions - ShopNow' });
    this.meta.updateTag({
      property: 'og:description',
      content: 'Découvrez nos meilleures offres promotionnelles',
    });
    this.meta.updateTag({ name: 'twitter:title', content: 'Promotions - ShopNow' });
    this.meta.updateTag({
      name: 'twitter:description',
      content: 'Découvrez nos meilleures offres promotionnelles',
    });

    // 🔹 Appel backend
    this.loading = true;
    this.error = null;

    this.productService.getProducts().subscribe({
      next: (all) => {
        this.promos = this.selectPromotions(all || []);
        this.loading = false;
      },
      error: (e) => {
        console.error('Promotions error:', e);
        this.error = e || true;
        this.loading = false;
      },
    });
  }

  /**
   * Sélectionne les produits en promo à partir de tous les produits backend
   * - si promoPrice < price -> vraie promo
   * - sinon, on peut générer une petite promo sur certaines catégories (audio, gaming, electronique…)
   */
  private selectPromotions(all: Product[]): ProductPromo[] {
    const list: ProductPromo[] = [];

    for (const p of all) {
      if (!p || typeof p.price !== 'number') continue;

      const basePrice = p.price;
      const promoPrice = p.promoPrice && p.promoPrice < p.price ? p.promoPrice : basePrice;

      let discountPercent: number | undefined;

      if (promoPrice < basePrice) {
        discountPercent = Math.round(((basePrice - promoPrice) / basePrice) * 100);
      } else {
        // 🔸 Option : générer une remise "virtuelle" sur certains types
        // Récupérer le slug ou le nom de catégorie
        let catSlug = '';
        if (typeof p.category === 'string') {
          catSlug = p.category.toLowerCase();
        } else if (p.category && typeof p.category === 'object') {
          catSlug =
            (p.category.slug || p.category.name || '').toString().toLowerCase();
        }

        const flagged = /audio|gaming|electronique|electronics/.test(catSlug);
        if (flagged) {
          const possible = [10, 15, 20, 25, 30];
          discountPercent = possible[Math.floor(Math.random() * possible.length)];
        }
      }

      if (!discountPercent) {
        // pas de réduction -> on ne l’affiche pas dans promos
        continue;
      }

      const image =
        (p.images && p.images[0]) ||
        'assets/placeholder-product.jpg'; // fallback si pas d'image

      const rating = (p as any).averageRating ?? 0;

      list.push({
        id: p._id,
        title: p.name,
        price: +(promoPrice.toFixed(2)),
        oldPrice: +(basePrice.toFixed(2)),
        discountPercent,
        rating,
        image,
      });
    }

    // Trier par % réduction desc, puis couper à 12
    list.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
    return list.slice(0, 12);
  }

  addToCart(p: ProductPromo) {
    this.cart.addToCart({
      id: p.id,           // string (Mongo _id)
      name: p.title,
      price: p.price,
      image: p.image,
      quantity: 1,
    });
    Swal.fire({
      icon: 'success',
      title: 'Produit ajouté !',
      text: `"${p.title}" a été ajouté à votre panier.`,
      timer: 2000,
      showConfirmButton: false,
      position: 'top-end',
      toast: true,
    });
  }

  reload() {
    location.reload();
  }
}
