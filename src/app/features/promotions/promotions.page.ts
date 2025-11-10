import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import { ProductStore, Product } from '../../services/product-store';
import { CartService } from '../../services/cart.service';

type ProductPromo = Product & {
  oldPrice?: number;
  discountPercent?: number;
};

@Component({
  standalone: true,
  selector: 'app-promotions',
  imports: [CommonModule, RouterLink, Header, Footer],
  templateUrl: './promotions.page.html',
  styleUrl: './promotions.page.scss',
})
export class PromotionsPage implements OnInit {
  Math=Math; // pour le template
  private title = inject(Title);
  private meta = inject(Meta);
  private store = inject(ProductStore);
  private cart = inject(CartService);

  loading = true;
  error: any = null;
  promos: ProductPromo[] = [];

  ngOnInit(): void {
    // SEO (équivalent aux meta du <head> côté React)
    this.title.setTitle('Promotions - ShopNow');
    this.meta.updateTag({ name: 'description', content: 'Découvrez nos meilleures offres promotionnelles' });
    this.meta.updateTag({ property: 'og:title', content: 'Promotions - ShopNow' });
    this.meta.updateTag({ property: 'og:description', content: 'Découvrez nos meilleures offres promotionnelles' });
    this.meta.updateTag({ name: 'twitter:title', content: 'Promotions - ShopNow' });
    this.meta.updateTag({ name: 'twitter:description', content: 'Découvrez nos meilleures offres promotionnelles' });

    // “ErrorBoundary” light
    try {
      this.store.getAllMerged$().subscribe({
        next: (all) => {
          this.promos = this.selectPromotions(all);
          this.loading = false;
        },
        error: (e) => {
          this.error = e || true;
          this.loading = false;
        }
      });
    } catch (e) {
      this.error = e || true;
      this.loading = false;
    }
  }

private selectPromotions(all: Product[]): ProductPromo[] {
  const enriched: ProductPromo[] = (all || []).map(p => {
    const cat = (p.category || '').toLowerCase();
    const flagged = /audio|gaming|electronique|electronics/.test(cat);

    // 🔸 Pourcentage aléatoire de réduction
    const discountPercent = flagged ? [10, 15, 20, 25, 30][Math.floor(Math.random() * 5)] : undefined;

    // 🔸 Calcul des prix en DT
    const oldPrice = p.price; // Prix initial
    const promoPrice = discountPercent ? +(oldPrice * (1 - discountPercent / 100)).toFixed(2) : oldPrice;

    return { ...p, oldPrice, price: promoPrice, discountPercent };
  });

  const promos = enriched.filter(p => p.discountPercent);
  promos.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
  return promos.slice(0, 12);
}



  addToCart(p: ProductPromo) {
    this.cart.addToCart({
      id: p.id,
      name: p.title,
      price: p.price,
      image: p.image,
      quantity: 1
    });
  }

  reload() {
    // version simple : recharger la page (même UX que l’ErrorBoundary React)
    location.reload();
  }
}
