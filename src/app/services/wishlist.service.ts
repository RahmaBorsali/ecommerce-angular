import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Product } from './product.service';
import { Observable } from 'rxjs';

export type WishItem = {
  id: string;
  title: string;
  price: number;
  image: string;
};

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private apiUrl = 'http://localhost:3000';
  private LS_KEY = 'app.wishlist';

  private cache: WishItem[] = this.readLocal();

  // --------- LocalStorage helpers ----------
  private readLocal(): WishItem[] {
    try {
      return JSON.parse(localStorage.getItem(this.LS_KEY) || '[]');
    } catch {
      return [];
    }
  }

  private saveLocal() {
    localStorage.setItem(this.LS_KEY, JSON.stringify(this.cache));
    window.dispatchEvent(new Event('wishlistUpdated'));
  }

  // --------- Auth headers ----------
  private getAuthOptions() {
    const raw = localStorage.getItem('app.session');
    if (!raw) return {};

    try {
      const session = JSON.parse(raw);
      const token = session?.token;

      if (!token) return {};

      return {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`,
        }),
      };
    } catch {
      return {};
    }
  }

  // Pour DELETE avec body + headers
  private getAuthOptionsWithBody(body: any) {
    const opts = this.getAuthOptions();
    return { ...opts, body };
  }

  // --------- API publique ----------
  list(): WishItem[] {
    return [...this.cache];
  }

  getAll(): WishItem[] {
    return this.list();
  }

  isFavorite(id: string): boolean {
    return this.cache.some((p) => p.id === id);
  }

  /** 🔄 À appeler après login (si tu veux resynchro) */
  syncFromServer() {
    const user = this.auth.currentUser();
    if (!user?.id) return;

    this.getByUser(user.id).subscribe({
      next: (list: any[]) => {
        this.cache = (list || []).map((p: any) => ({
          id: p._id,
          title: p.name,
          price: p.promoPrice ?? p.price,
          image: p.images?.[0] || 'assets/placeholder-product.jpg',
        }));
        this.saveLocal();
      },
      error: (err) => console.error('wishlist sync error', err),
    });
  }

  /** ❤️ / 💔 depuis la fiche produit */
  toggle(item: WishItem) {
    const user = this.auth.currentUser();
    if (!user?.id) {
      return;
    }

    const already = this.isFavorite(item.id);

    // 1) mise à jour immédiate pour l’UI
    if (already) {
      this.cache = this.cache.filter((x) => x.id !== item.id);
    } else {
      this.cache.push(item);
    }
    this.saveLocal();

    // 2) mise à jour backend
    if (already) {
      this.http
        .delete(
          `${this.apiUrl}/wishlist`,
          this.getAuthOptionsWithBody({
            userId: user.id,
            productId: item.id,
          })
        )
        .subscribe({
          error: (err) => console.error('removeFromWishlist error', err),
        });
    } else {
      this.http
        .post(
          `${this.apiUrl}/wishlist`,
          { userId: user.id, productId: item.id },
          this.getAuthOptions()
        )
        .subscribe({
          error: (err) => console.error('addToWishlist error', err),
        });
    }
  }

  /** utilisé par AccountWishlist → bouton "Retirer" */
  remove(productId: string) {
    const user = this.auth.currentUser();

    this.cache = this.cache.filter((x) => x.id !== productId);
    this.saveLocal();

    if (!user?.id) return;

    this.http
      .delete(
        `${this.apiUrl}/wishlist`,
        this.getAuthOptionsWithBody({
          userId: user.id,
          productId,
        })
      )
      .subscribe({
        error: (err) => console.error('removeFromWishlist error', err),
      });
  }

  clearAll() {
    const user = this.auth.currentUser();

    this.cache = [];
    this.saveLocal();

    if (!user?.id) return;

    this.http
      .delete(
        `${this.apiUrl}/wishlist/clear/${user.id}`,
        this.getAuthOptions()
      )
      .subscribe({
        error: (err) => console.error('clearWishlist error', err),
      });
  }

  /** 🔵 pour AccountLayout : récupère les favoris depuis le backend */
  getByUser(userId: string): Observable<Product[]> {
    return this.http.get<Product[]>(
      `${this.apiUrl}/wishlist/${userId}`,
      this.getAuthOptions()
    );
  }
}
