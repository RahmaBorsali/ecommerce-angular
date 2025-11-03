import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import { ProductStore, Product } from '../../services/product-store';
import { CartService } from '../../services/cart.service';
import Swal from 'sweetalert2';
import { FakeStore } from '../../services/fakestore';

type Spec = { label: string; value: string };
type Review = { author: string; rating: number; date: string; comment: string };

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, Header, Footer, RouterLink],
  templateUrl: './product-details.page.html',
})
export class ProductDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private store = inject(ProductStore);
  private cart = inject(CartService);
  private fake = inject(FakeStore);

  product?: Product;
  similar: Product[] = [];
  images: string[] = [];
  current = 0;

  loading = false;
  error: any = null;

  // infos additionnelles (lues depuis le produit si dispo)
  inStock = false;
  stockCount = 0;
  specs: Spec[] = [];
  reviews: Review[] = [];

  qty = 1;

  // product-details.page.ts (extrait)
  ngOnInit(): void {
    this.route.paramMap.subscribe((pm) => {
      const key = pm.get('id'); // peut être "12" ou "fs-5"
      if (!key) {
        this.error = true;
        return;
      }
      this.loadKey(key);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  // Regroupe les catégories locales + FakeStore dans des familles
  private normalizeCat(c: string): string {
    const s = (c || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '');

    if (/(electronique|informatique|audio|gaming|accessoires|photo|electronics)/.test(s))
      return 'tech';
    if (/(maison|home|appliance)/.test(s)) return 'home';
    if (/(beaute|beauty|cosmetic)/.test(s)) return 'beauty';
    if (/(jewel|bijou|jewellery|jewelery)/.test(s)) return 'jewelry';
    if (/(men|women|vetement|clothing|apparel)/.test(s)) return 'fashion';

    return 'other';
  }

  private loadKey(key: string) {
    this.loading = true;
    this.error = null;

    this.store.getOneByKey$(key).subscribe({
      next: (p) => {
        this.setProductData(p);

        // ✅ similaires fusionnés + catégories normalisées
        this.store.getAllMerged$().subscribe((all) => {
          const fam = this.normalizeCat(p.category);
          this.similar = all
            .filter((x) => x.id !== p.id && this.normalizeCat(x.category) === fam)
            .slice(0, 8);
        });

        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  private load(id: number) {
    this.loading = true;
    this.error = null;

    this.store.getOne$(id).subscribe({
      next: (p) => {
        if (!p) {
          this.error = true;
          this.loading = false;
          return;
        }
        this.setProductData(p);

        this.store.getAllMerged$().subscribe((all) => {
          const fam = this.normalizeCat(p.category);
          this.similar = all
            .filter((x) => x.id !== p.id && this.normalizeCat(x.category) === fam)
            .slice(0, 8);
        });

        this.loading = false;
      },
      error: (e) => {
        this.error = e;
        this.loading = false;
      },
    });
  }

  private setProductData(p: Product) {
    this.product = p;

    const imgs = (p.images ?? []).filter(Boolean);
    while (imgs.length < 3) imgs.push(p.image);
    this.images = imgs.slice(0, 3);

    this.stockCount = p.stock ?? 10;
    this.inStock = this.stockCount > 0;
    this.specs = p.specs ?? [];
    this.reviews = p.reviews ?? [];
  }

  // ⭐ notation produit principal
  rateRounded(): number {
    return Math.floor(this.product?.rating ?? 0);
  }
  rateRaw(): number {
    return this.product?.rating ?? 0;
  }

  // 🛒 quantité
  decQty() {
    this.qty = Math.max(1, this.qty - 1);
  }
  incQty() {
    this.qty = Math.min(99, this.qty + 1);
  }

  addToCart() {
    if (!this.product) return;
    this.cart.addToCart({
      id: this.product.id,
      name: this.product.title,
      price: this.product.price,
      image: this.images[this.current] ?? this.product.image,
      quantity: this.qty,
    });
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Ajouté au panier 🛒',
      timer: 1500,
      showConfirmButton: false,
    });
  }

  // 🎯 galerie
  select(i: number) {
    this.current = i;
  }
  isActive(i: number) {
    return this.current === i;
  }

  // helpers *ngFor
  trackByLabel = (_: number, s: Spec) => s.label;
  trackByReview = (_: number, r: Review) => r.author + r.date;
  starLine(n: number) {
    return Array.from({ length: 5 }, (_, i) => i < Math.floor(n));
  }
}
