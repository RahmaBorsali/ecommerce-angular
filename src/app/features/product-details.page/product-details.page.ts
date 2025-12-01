import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';

import { CartService } from '../../services/cart.service';
import Swal from 'sweetalert2';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { WishlistService } from '../../services/wishlist.service';
import { ProductService, Product as BackendProduct } from '../../services/product.service';
import { ReviewService } from '../../services/review.service';
import { firstValueFrom } from 'rxjs';

type Spec = { label: string; value: string };

type Review = {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
};

type ProductView = {
  id: string;
  title: string;
  description?: string;
  price: number;
  basePrice: number;
  image: string;
  images: string[];
  rating: number;
  stock: number;
  categorySlug?: string;
};

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, Header, Footer, RouterLink, ReactiveFormsModule],
  templateUrl: './product-details.page.html',
})
export class ProductDetailPage implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cart = inject(CartService);
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private wishlist = inject(WishlistService);
  private reviewSvc = inject(ReviewService);

  product?: ProductView;
  similar: ProductView[] = [];

  images: string[] = [];
  current = 0;

  loading = false;
  error: any = null;

  inStock = false;
  stockCount = 0;
  specs: Spec[] = [];
  reviews: Review[] = [];

  qty = 1;
  isFav = false;

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
  get rating(): number {
    return Number(this.reviewForm.get('rating')?.value ?? 0);
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((pm) => {
      const id = pm.get('id');
      if (!id) {
        this.error = true;
        return;
      }
      this.loadProduct(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ========= Chargement produit + similaires =========

  private loadProduct(id: string) {
    this.loading = true;
    this.error = null;

    this.productService.getProducts().subscribe({
      next: (arr) => {
        const list = arr || [];
        const found = list.find((p) => p._id === id);

        console.log('loadProduct id =', id, 'found =', found);

        if (!found) {
          this.error = true;
          this.loading = false;
          return;
        }

        const vm = this.toViewModel(found);
        this.product = vm;

        this.images = vm.images;
        this.stockCount = vm.stock;
        this.inStock = vm.stock > 0;

        // 🔹 Charger les avis depuis la BD
        this.loadReviews(vm.id);

        // 🔹 Pré-remplir l’auteur si utilisateur connecté
        const u = this.auth.currentUser();
        if (u && !this.reviewForm.value.author) {
          this.reviewForm.patchValue({
            author: `${u.firstName} ${u.lastName}`.trim(),
          });
        }

        // 🔹 Favoris
        this.isFav = this.wishlist.isFavorite(vm.id);

        // 🔹 Produits similaires (même catégorie)
        this.loadSimilar(found);

        this.loading = false;
      },
      error: (err) => {
        console.error('getProducts() error pour la fiche produit', err);
        this.error = true;
        this.loading = false;
      },
    });
  }

  private loadSimilar(source: BackendProduct) {
    const sourceCat = this.normalizeCat(this.getCategorySlug(source));
    if (!sourceCat) {
      this.similar = [];
      return;
    }

    this.productService.getProducts().subscribe({
      next: (all) => {
        const list = all || [];
        const meId = source._id;

        this.similar = list
          .filter((p) => {
            if (!p || p._id === meId) return false;
            const cat = this.normalizeCat(this.getCategorySlug(p));
            return cat === sourceCat;
          })
          .map((p) => this.toViewModel(p))
          .slice(0, 8);
      },
      error: () => {
        this.similar = [];
      },
    });
  }

  private loadReviews(productId: string) {
    this.reviewSvc.getByProduct(productId).subscribe({
      next: (list) => {
        this.reviews = (list || []).map((r) => {
          const fullName =
            r.user && (r.user.firstName || r.user.lastName)
              ? `${r.user.firstName || ''} ${r.user.lastName || ''}`.trim()
              : 'Client';

          return {
            id: r._id,
            author: fullName || 'Client',
            rating: r.rating,
            comment: r.comment || '',
            date: r.createdAt,
          };
        });
      },
      error: (err) => {
        console.error('loadReviews error', err);
        this.reviews = [];
      },
    });
  }

  // Conversion backend -> vue utilisée par le template
  private toViewModel(p: BackendProduct): ProductView {
    const imgs =
      p.images && p.images.length
        ? p.images.filter(Boolean)
        : ['assets/placeholder-product.jpg'];

    const base = p.price;
    const final = p.promoPrice && p.promoPrice < p.price ? p.promoPrice : p.price;
    const rating = (p as any).averageRating ?? 0;

    let categorySlug = '';
    if (typeof p.category === 'string') {
      categorySlug = p.category;
    } else if (p.category && typeof p.category === 'object') {
      categorySlug = p.category.slug || p.category.name || '';
    }

    return {
      id: p._id,
      title: p.name,
      description: p.description,
      price: final,
      basePrice: base,
      image: imgs[0],
      images: imgs.slice(0, 3),
      rating,
      stock: p.stock ?? 0,
      categorySlug,
    };
  }

  // ========= Galerie =========
  select(i: number) {
    this.current = i;
  }
  isActive(i: number) {
    return this.current === i;
  }

  // ========= Stock & Note =========
  rateRounded(): number {
    return Math.floor(this.product?.rating ?? 0);
  }
  rateRaw(): number {
    return this.product?.rating ?? 0;
  }

  // ========= Quantité & Panier =========
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

  // ========= Favoris / Wishlist =========
  toggleFav() {
    if (!this.product) return;

    const user = this.auth.currentUser();
    if (!user) {
      Swal.fire({
        title: 'Connexion requise',
        text: 'Veuillez vous connecter pour ajouter des produits à vos favoris 💙',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Se connecter',
        cancelButtonText: 'Annuler',
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#6b7280',
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/auth/signin']);
        }
      });
      return;
    }

    this.wishlist.toggle({
      id: this.product.id,
      title: this.product.title,
      price: this.product.price,
      image: this.images[this.current] ?? this.product.image,
    });

    this.isFav = this.wishlist.isFavorite(this.product.id);

    Swal.fire({
      toast: true,
      position: 'top-end',
      timer: 1200,
      showConfirmButton: false,
      icon: this.isFav ? 'success' : 'info',
      title: this.isFav ? 'Ajouté aux favoris ❤' : 'Retiré des favoris',
    });
  }

  // ========= Avis : en BD =========
  setRating(n: number) {
    this.reviewForm.patchValue({ rating: n });
  }

  async submitReview() {
    if (!this.product) return;

    const user = this.auth.currentUser();
    if (!user?.id) {
      const res = await Swal.fire({
        title: 'Connexion requise',
        text: 'Veuillez vous connecter pour laisser un avis 💙',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Se connecter',
        cancelButtonText: 'Annuler',
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#6b7280',
      });

      if (res.isConfirmed) {
        this.router.navigate(['/auth/signin']);
      }
      return;
    }

    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    const value = this.reviewForm.getRawValue();
    const rating = Math.max(1, Math.min(5, Number(value.rating)));
    const comment = (value.comment || '').trim();
    if (!comment) return;

    this.submittingReview = true;
    try {
      await firstValueFrom(
        this.reviewSvc.create({
          productId: this.product.id,
          userId: user.id,
          rating,
          comment,
        })
      );

      this.loadReviews(this.product.id);

      this.reviewForm.patchValue({ rating: 0, comment: '' });
      this.reviewMsg = 'Merci pour votre avis !';

      await Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Avis publié ✅',
        timer: 1600,
        showConfirmButton: false,
      });

      setTimeout(() => (this.reviewMsg = ''), 2000);
    } catch (err) {
      console.error('submitReview error', err);
      await Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: "Impossible d'enregistrer votre avis",
        timer: 2000,
        showConfirmButton: false,
      });
    } finally {
      this.submittingReview = false;
    }
  }

  // helpers *ngFor
  trackByLabel = (_: number, s: Spec) => s.label;
  trackByReview = (_: number, r: Review) => r.id;
  starLine(n: number) {
    return Array.from({ length: 5 }, (_, i) => i < Math.floor(n));
  }

  private getCategorySlug(p: BackendProduct): string {
    if (!p.category) return '';
    if (typeof p.category === 'string') return p.category;
    return p.category.slug || p.category.name || '';
  }

  private normalizeCat(c: string): string {
    return (c || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .trim();
  }
}
