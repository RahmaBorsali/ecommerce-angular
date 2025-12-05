import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

export type CartMeta = {
  shippingFee: number;
  freeShippingThreshold: number;
  couponCode?: string;
};

const CART_PREFIX = 'app.cart.';
const META_PREFIX = 'app.cartmeta.';
const GUEST_KEY = 'app.guestId';

type BackendCartProduct = {
  _id: string;
  name: string;
  price: number;
  promoPrice?: number;
  images?: string[];
};

type BackendCart = {
  user: string;
  items: {
    product: BackendCartProduct | string;
    quantity: number;
  }[];
};

@Injectable({ providedIn: 'root' })
export class CartService {
  private auth = inject(AuthService);
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000'; // 🔁 adapte si besoin

  // ----------- Clés par utilisateur (ou invité) -----------
  private get cartKey(): string {
    return `${CART_PREFIX}${this.uid()}`;
  }

  private get metaKey(): string {
    return `${META_PREFIX}${this.uid()}`;
  }

  private readonly defaultMeta: CartMeta = {
    shippingFee: 8,
    freeShippingThreshold: 8000,
    couponCode: '',
  };

  private uid(): string {
    const u = this.auth.currentUser();
    if (u?.id) return String(u.id); // ✅ id du user connecté

    // invité : id par session (onglet)
    let gid = sessionStorage.getItem(GUEST_KEY);
    if (!gid) {
      gid = crypto.randomUUID();
      sessionStorage.setItem(GUEST_KEY, gid);
    }
    return `guest-${gid}`;
  }

  // -------- Storage helpers ----------
  private read<T>(key: string, fallback: T): T {
    try {
      return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback;
    } catch {
      return fallback;
    }
  }

  private write<T>(key: string, val: T) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  private emit() {
    window.dispatchEvent(new Event('cartUpdated'));
  }

  // 🔁 Map du panier backend -> panier front
  private mapBackendCartToLocal(cart: BackendCart): CartItem[] {
    if (!cart || !Array.isArray(cart.items)) return [];

    return cart.items
      .map((row) => {
        const p = row.product as BackendCartProduct;
        if (!p || typeof p !== 'object') return null;

        const img = p.images && p.images.length ? p.images[0] : '';
        const price = p.promoPrice && p.promoPrice < p.price ? p.promoPrice : p.price;

        return {
          id: String(p._id),
          name: p.name,
          price: price,
          image: img,
          quantity: Number(row.quantity) || 1,
        } as CartItem;
      })
      .filter(Boolean) as CartItem[];
  }

  // ---------- CART (local) ----------
  getCart(): CartItem[] {
    const raw = localStorage.getItem(this.cartKey);
    const arr = raw ? (JSON.parse(raw) as any[]) : [];

    return arr.map((it) => ({
      id: String(it.id),
      name: it.name ?? it.title ?? 'Produit',
      price: Number(it.price) || 0,
      image: it.image ?? '',
      quantity: Number(it.quantity) > 0 ? Number(it.quantity) : 1,
    }));
  }

  setCart(items: CartItem[]) {
    this.write(this.cartKey, items);
    this.emit();
  }

  addToCart(item: CartItem) {
    const current = this.getCart();
    const idx = current.findIndex((x) => x.id === item.id);

    let next: CartItem[];

    if (idx >= 0) {
      next = current.map((x, i) =>
        i === idx
          ? {
              ...x,
              quantity: x.quantity + (item.quantity || 1),
            }
          : x
      );
    } else {
      const newItem: CartItem = {
        id: String(item.id),
        name: item.name,
        price: Number(item.price) || 0,
        image: item.image ?? '',
        quantity: item.quantity > 0 ? item.quantity : 1,
      };

      next = [...current, newItem];
    }

    this.setCart(next);

    // 💾 on ne sync que pour l’item en plus, c’est ok
    this.syncAddToServer({
      ...item,
      quantity: item.quantity > 0 ? item.quantity : 1,
    });
  }

  updateQuantity(id: string, qty: number) {
    const cart = this.getCart().map((i) =>
      i.id === id ? { ...i, quantity: Math.max(1, qty) } : i
    );
    this.setCart(cart);

    this.syncUpdateToServer(id, Math.max(1, qty));
  }

  removeFromCart(id: string) {
    this.setCart(this.getCart().filter((i) => i.id !== id));
    this.syncRemoveFromServer(id);
  }

  clearCart() {
    localStorage.removeItem(this.cartKey);
    this.emit();
    this.syncClearOnServer();
  }

  // ---------- META ----------
  getMeta(): CartMeta {
    try {
      const raw = localStorage.getItem(this.metaKey);
      const meta = raw ? (JSON.parse(raw) as Partial<CartMeta>) : {};
      const merged: CartMeta = { ...this.defaultMeta, ...meta };

      const valid = ['SALE10', 'FREESHIP'];
      if (merged.couponCode && !valid.includes(merged.couponCode.toUpperCase())) {
        merged.couponCode = '';
      }
      return merged;
    } catch {
      return { ...this.defaultMeta };
    }
  }

  setMeta(patch: Partial<CartMeta>): CartMeta {
    const next = { ...this.getMeta(), ...patch };
    this.write(this.metaKey, next);
    this.emit();
    return next;
  }

  // ---------- CALCULES ----------
  calcSubtotal(items: CartItem[]): number {
    return items.reduce((s, i) => s + i.price * i.quantity, 0);
  }

  calcDiscount(subtotal: number, meta: CartMeta): number {
    const code = (meta.couponCode || '').toUpperCase();
    if (code === 'SALE10') return +(subtotal * 0.1).toFixed(2);
    return 0;
  }

  calcShipping(subtotal: number, meta: CartMeta, opts?: { express?: boolean }): number {
    if (subtotal <= 0) return 0;

    const fee = meta.shippingFee ?? this.defaultMeta.shippingFee;
    const threshold = meta.freeShippingThreshold ?? this.defaultMeta.freeShippingThreshold;
    const code = (meta.couponCode || '').toUpperCase();

    let base = 0;
    if (code === 'FREESHIP') {
      base = 0;
    } else {
      base = subtotal >= threshold ? 0 : fee;
    }

    const expressSurcharge = opts?.express ? 4 : 0;
    return base + expressSurcharge;
  }

  calcTotal(subtotal: number, shipping: number, discount: number): number {
    return Math.max(0, subtotal - discount) + shipping;
  }

  // ---------- SYNC BACKEND (pour user connecté) ----------

  /** Charger le panier depuis Mongo et écraser le local */
  syncFromServer() {
    const user = this.auth.currentUser();
    if (!user?.id) return;

    this.http.get<BackendCart>(`${this.apiUrl}/cart/user/${user.id}`).subscribe({
      next: (cart) => {
        const items = this.mapBackendCartToLocal(cart);
        this.setCart(items);
      },
      error: (err) => {
        console.error('syncFromServer error', err);
      },
    });
  }

  private syncAddToServer(item: CartItem) {
    const user = this.auth.currentUser();
    if (!user?.id) return; // invité → pas de backend

    this.http
      .post<BackendCart>(`${this.apiUrl}/cart/add`, {
        userId: user.id,
        productId: item.id,
        quantity: item.quantity,
      })
      .subscribe({
        next: (cart) => {
          const items = this.mapBackendCartToLocal(cart);
          this.setCart(items); // 🔁 on aligne avec la vérité backend
        },
        error: (err) => console.error('cart/add error', err),
      });
  }

  private syncUpdateToServer(productId: string, quantity: number) {
    const user = this.auth.currentUser();
    if (!user?.id) return;

    this.http
      .put<BackendCart>(`${this.apiUrl}/cart/update`, {
        userId: user.id,
        productId,
        quantity,
      })
      .subscribe({
        next: (cart) => {
          const items = this.mapBackendCartToLocal(cart);
          this.setCart(items);
        },
        error: (err) => console.error('cart/update error', err),
      });
  }

  private syncRemoveFromServer(productId: string) {
    const user = this.auth.currentUser();
    if (!user?.id) return;

    this.http
      .request<BackendCart>('DELETE', `${this.apiUrl}/cart/remove`, {
        body: { userId: user.id, productId },
      })
      .subscribe({
        next: (cart) => {
          const items = this.mapBackendCartToLocal(cart);
          this.setCart(items);
        },
        error: (err) => console.error('cart/remove error', err),
      });
  }

  private syncClearOnServer() {
    const user = this.auth.currentUser();
    if (!user?.id) return;

    this.http.delete(`${this.apiUrl}/cart/clear/${user.id}`).subscribe({
      next: () => {
        // backend OK, local déjà vidé
      },
      error: (err) => console.error('cart/clear error', err),
    });
  }

  // ---------- MIGRATION GUEST → USER (déjà discuté) ----------
  migrateGuestCartToUser() {
    const user = this.auth.currentUser();
    if (!user?.id) return;

    const gid = sessionStorage.getItem(GUEST_KEY);
    if (!gid) return;

    const guestKey = `${CART_PREFIX}guest-${gid}`;
    const rawGuest = localStorage.getItem(guestKey);
    if (!rawGuest) return;

    let guestItems: CartItem[];
    try {
      guestItems = JSON.parse(rawGuest) as CartItem[];
    } catch {
      return;
    }

    // 1) fusion locale (pour que l’UI voie tout de suite le bon panier)
    const userCart = this.getCart();
    const merged = [...userCart];

    for (const g of guestItems) {
      const id = String(g.id);
      const idx = merged.findIndex((x) => x.id === id);
      if (idx >= 0) {
        merged[idx].quantity += Number(g.quantity) || 1;
      } else {
        merged.push({
          id,
          name: g.name ?? 'Produit',
          price: Number(g.price) || 0,
          image: g.image ?? '',
          quantity: Number(g.quantity) || 1,
        });
      }
    }

    this.setCart(merged);

    // 2) pousser ça vers le backend (un add par item)
    merged.forEach((it) => this.syncAddToServer(it));

    // 3) nettoyer guest
    localStorage.removeItem(guestKey);
    sessionStorage.removeItem(GUEST_KEY);
  }
}
