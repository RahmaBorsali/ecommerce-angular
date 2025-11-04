import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import { ProductStore, Product } from '../../services/product-store';
import { CartService } from '../../services/cart.service';
import Swal from 'sweetalert2';
import { FakeStore } from '../../services/fakestore';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { take } from 'rxjs/operators';

type Spec = { label: string; value: string };
type Review = { author: string; rating: number; date: string; comment: string };

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, Header, Footer, RouterLink, ReactiveFormsModule],
  templateUrl: './product-details.page.html',
})
export class ProductDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private store = inject(ProductStore);
  private cart = inject(CartService);
  private fake = inject(FakeStore);
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

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
  reviews: Review[] = []; // ⚠️ inclut les avis stockés en local

  qty = 1;

  // ---- Avis (form) ----
  submittingReview = false;
  reviewMsg = '';
  reviewForm = this.fb.group({
    author: ['', [Validators.required, Validators.minLength(2)]],
    rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['', [Validators.required, Validators.minLength(5)]],
  });
  get rf() {
    return this.reviewForm.controls;
  }

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
  /** slug normalisé de catégorie pour comparaison stricte */
  private exactCatSlug(c: string | undefined | null): string {
    return (c ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /** similaires STRICTS : même catégorie exacte uniquement (pas de fallback, pas de mélange) */
  private buildSimilarStrict(all: Product[], current: Product, limit = 8): Product[] {
    const currId = current.id;
    const exact = this.exactCatSlug(current.category);

    return all
      .filter((p) => p && p.id !== currId && this.exactCatSlug(p.category) === exact)
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)) // tri optionnel: mieux notés d’abord
      .slice(0, limit);
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

    this.store
      .getOneByKey$(key)
      .pipe(take(1))
      .subscribe({
        next: (p) => {
          this.setProductData(p);

          this.store
            .getAllMerged$()
            .pipe(take(1))
            .subscribe((all) => {
              this.similar = this.buildSimilarStrict(all, p);
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

    this.store
      .getOne$(id)
      .pipe(take(1))
      .subscribe({
        next: (p) => {
          if (!p) {
            this.error = true;
            this.loading = false;
            return;
          }
          this.setProductData(p);

          this.store
            .getAllMerged$()
            .pipe(take(1))
            .subscribe((all) => {
              this.similar = this.buildSimilarStrict(all, p);
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

    // 1) avis du produit (si fournis par la source)
    const base = p.reviews ?? [];

    // 2) avis locaux (localStorage) — fusion
    const local = this.loadLocalReviews(p.id);
    this.reviews = [...local, ...base]; // choix: locals d’abord

    // Pré-remplir l’auteur si l’utilisateur est logué
    const u = this.auth.currentUser();
    if (u && !this.reviewForm.value.author) {
      this.reviewForm.patchValue({ author: `${u.firstName} ${u.lastName}`.trim() });
    }
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

  // ========= Avis : LocalStorage =========
  private lsKeyForReviews(productId: number | string) {
    return `app.reviews.${productId}`;
  }

  private loadLocalReviews(productId: number | string): Review[] {
    try {
      return JSON.parse(localStorage.getItem(this.lsKeyForReviews(productId)) || '[]');
    } catch {
      return [];
    }
  }

  private saveLocalReviews(productId: number | string, items: Review[]) {
    localStorage.setItem(this.lsKeyForReviews(productId), JSON.stringify(items));
  }

  setRating(n: number) {
    this.reviewForm.patchValue({ rating: n });
  }

  async submitReview() {
    if (!this.product) return;
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    const value = this.reviewForm.getRawValue();
    const newItem: Review = {
      author: value.author!.trim(),
      rating: Math.max(1, Math.min(5, Number(value.rating))),
      comment: (value.comment || '').trim(),
      date: new Date().toISOString(),
    };

    this.submittingReview = true;
    try {
      // 1) sauvegarde localStorage
      const currentLocal = this.loadLocalReviews(this.product.id);
      const nextLocal = [newItem, ...currentLocal];
      this.saveLocalReviews(this.product.id, nextLocal);

      // 2) rafraîchir la liste affichée (locals + base)
      const base = this.product.reviews ?? [];
      this.reviews = [...nextLocal, ...base];

      // 3) reset UI
      this.reviewForm.patchValue({ rating: 0, comment: '' });
      this.reviewMsg = 'Merci pour votre avis !';

      // Toast
      await Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Avis publié ✅',
        timer: 1600,
        showConfirmButton: false,
      });

      setTimeout(() => (this.reviewMsg = ''), 2000);
    } finally {
      this.submittingReview = false;
    }
  }
  get rating(): number {
    return Number(this.reviewForm.get('rating')?.value ?? 0);
  }
}
