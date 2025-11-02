import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartKey = 'cart';
  private cartCount = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCount.asObservable();

  constructor() {
    this.updateCartCount();
    // Synchronisation entre onglets
    window.addEventListener('storage', () => this.updateCartCount());
  }

  /** 🔹 Récupère le panier complet */
  getCart(): CartItem[] {
    return JSON.parse(localStorage.getItem(this.cartKey) || '[]');
  }

  /** 🔹 Enregistre et notifie */
  private saveCart(cart: CartItem[]) {
    localStorage.setItem(this.cartKey, JSON.stringify(cart));
    this.updateCartCount();
    window.dispatchEvent(new Event('cartUpdated'));
  }

  /** 🔹 Ajout ou incrément */
  addToCart(item: CartItem) {
    const cart = this.getCart();
    const existing = cart.find(p => p.id === item.id);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      cart.push(item);
    }
    this.saveCart(cart);
  }

  /** 🔹 Mise à jour quantité */
  updateQuantity(productId: number, newQuantity: number) {
    const cart = this.getCart();
    const index = cart.findIndex(i => i.id === productId);
    if (index !== -1) {
      if (newQuantity <= 0) cart.splice(index, 1);
      else cart[index].quantity = newQuantity;
      this.saveCart(cart);
    }
  }

  /** 🔹 Suppression */
  removeFromCart(productId: number) {
    const cart = this.getCart().filter(i => i.id !== productId);
    this.saveCart(cart);
  }

  /** 🔹 Vide le panier */
  clearCart() {
    localStorage.removeItem(this.cartKey);
    this.updateCartCount();
    window.dispatchEvent(new Event('cartUpdated'));
  }

  /** 🔹 Calcul du total */
  getCartTotal(): number {
    return this.getCart().reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  /** 🔹 Compteur */
  private updateCartCount() {
    const cart = this.getCart();
    const totalQty = cart.reduce((sum, i) => sum + i.quantity, 0);
    this.cartCount.next(totalQty);
  }

  /** 🔹 Lecture rapide du compteur */
  getCartCount(): number {
    return this.cartCount.value;
  }
}
