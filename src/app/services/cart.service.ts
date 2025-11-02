import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// services/cart.service.ts
export type CartItem = { id:number; name:string; price:number; image:string; quantity:number; };
type CartMeta = {
  couponCode?: string;
  discount?: number;               // DT
  shippingFee?: number;            // DT (standard)
  freeShippingThreshold?: number;  // DT
};

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartKey = 'cart';
  private metaKey = 'cartMeta';

  // --- CART ---
  getCart(): CartItem[] {
    const arr = JSON.parse(localStorage.getItem(this.cartKey) || '[]');
    return arr.map((it:any)=>({
      id: it.id, name: it.name ?? it.title ?? 'Produit',
      price: +it.price || 0, image: it.image ?? '', quantity: +it.quantity>0 ? +it.quantity : 1
    }));
  }
  setCart(items: CartItem[]) {
    localStorage.setItem(this.cartKey, JSON.stringify(items));
    window.dispatchEvent(new Event('cartUpdated'));
  }
  addToCart(item: CartItem) {
    const cart = this.getCart();
    const i = cart.findIndex(x => x.id === item.id);
    if (i>=0) cart[i].quantity += item.quantity; else cart.push(item);
    this.setCart(cart);
  }
  updateQuantity(id:number, qty:number) {
    const cart = this.getCart().map(i => i.id===id ? {...i, quantity: Math.max(1, qty)} : i);
    this.setCart(cart);
  }
  removeFromCart(id:number) { this.setCart(this.getCart().filter(i => i.id!==id)); }
  clearCart() { localStorage.removeItem(this.cartKey); window.dispatchEvent(new Event('cartUpdated')); }

  // --- META (coupon / frais / seuil) ---
  getMeta(): CartMeta {
    const m: CartMeta = JSON.parse(localStorage.getItem(this.metaKey) || '{}');
    return {
      couponCode: m.couponCode ?? '',
      discount: m.discount ?? 0,
      shippingFee: m.shippingFee ?? 8,          // ton 8 DT
      freeShippingThreshold: m.freeShippingThreshold ?? 10000,
    };
  }
  setMeta(partial: Partial<CartMeta>) {
    const m = { ...this.getMeta(), ...partial };
    localStorage.setItem(this.metaKey, JSON.stringify(m));
    return m;
  }

  // --- Calculs partagés (évite les incohérences) ---
  calcSubtotal(cart: CartItem[]) { return cart.reduce((s,i)=>s + i.price*i.quantity, 0); }
  calcShipping(subtotal:number, meta:CartMeta, mode:'standard'|'express'|'relay'='standard') {
    if (subtotal <= 0) return 0;
    if ((meta.freeShippingThreshold ?? 0) && subtotal >= (meta.freeShippingThreshold as number)) return 0;
    const map = { standard: meta.shippingFee ?? 8, express: 19.99, relay: 4.99 };
    return map[mode];
  }
  calcTotal(sub:number, ship:number, discount:number) { return Math.max(0, sub - (discount||0)) + ship; }
}
