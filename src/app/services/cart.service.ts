import { Injectable } from '@angular/core';

export type CartItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

export type CartMeta = {
  shippingFee: number; // ex: 8
  freeShippingThreshold: number; // ex: 10000
  couponCode?: string; // 'SALE10' | 'FREESHIP' | ''
};

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly cartKey = 'cart';
  private readonly metaKey = 'cart_meta';

  private readonly defaultMeta: CartMeta = {
    shippingFee: 8,
    freeShippingThreshold: 10000,
    couponCode: '',
  };

  // ---------- CART ----------
  getCart(): CartItem[] {
    const raw = localStorage.getItem(this.cartKey);
    const arr = raw ? JSON.parse(raw) : [];
    return (arr as any[]).map((it) => ({
      id: Number(it.id),
      name: it.name ?? it.title ?? 'Produit',
      price: Number(it.price) || 0,
      image: it.image ?? '',
      quantity: Number(it.quantity) > 0 ? Number(it.quantity) : 1,
    }));
  }

  setCart(items: CartItem[]) {
    localStorage.setItem(this.cartKey, JSON.stringify(items));
    window.dispatchEvent(new Event('cartUpdated'));
  }

  addToCart(item: CartItem) {
    const cart = this.getCart();
    const i = cart.findIndex((x) => x.id === item.id);
    if (i >= 0) cart[i].quantity += item.quantity;
    else cart.push(item);
    this.setCart(cart);
  }

  updateQuantity(id: number, qty: number) {
    const cart = this.getCart().map((i) =>
      i.id === id ? { ...i, quantity: Math.max(1, qty) } : i
    );
    this.setCart(cart);
  }

  removeFromCart(id: number) {
    this.setCart(this.getCart().filter((i) => i.id !== id));
  }

  clearCart() {
    localStorage.removeItem(this.cartKey);
    window.dispatchEvent(new Event('cartUpdated'));
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
    localStorage.setItem(this.metaKey, JSON.stringify(next));
    window.dispatchEvent(new Event('cartUpdated'));
    return next;
  }

  // ---------- CALCULES ----------
  calcSubtotal(items: CartItem[]): number {
    return items.reduce((s, i) => s + i.price * i.quantity, 0);
  }

  // SALE10 = 10% ; FREESHIP ne touche pas au prix produits
  calcDiscount(subtotal: number, meta: CartMeta): number {
    const code = (meta.couponCode || '').toUpperCase();
    if (code === 'SALE10') return +(subtotal * 0.1).toFixed(2);
    return 0;
  }

  // Livraison:
  // - panier vide -> 0
  // - FREESHIP -> base 0 (hors express)
  // - sinon base = fee si < threshold
  // - +4 si express coché
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
}
