// src/app/features/cart/cart-items.component.ts
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { CartService, CartItem, CartMeta } from '../../services/cart.service';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cart-items',
  standalone: true,
  imports: [CommonModule, RouterLink, Header, Footer, FormsModule],
  templateUrl: './cart-items.html',
})
export class CartItems implements OnInit, OnDestroy {
  Math = Math; // pour l’utilisation dans le template
  private cartSvc = inject(CartService);

  cart: CartItem[] = [];
  meta: CartMeta = this.cartSvc.getMeta();
  couponCode = '';

  private onCartUpdated = () => this.load();
  private onStorage = (e: StorageEvent) => {
    if (e.key === 'cart' || e.key === 'cart_meta' || e.key === null) this.load();
  };

  ngOnInit(): void {
    this.load();
    window.addEventListener('cartUpdated', this.onCartUpdated);
    window.addEventListener('storage', this.onStorage);
  }

  ngOnDestroy(): void {
    window.removeEventListener('cartUpdated', this.onCartUpdated);
    window.removeEventListener('storage', this.onStorage);
  }

  load() {
    this.cart = this.cartSvc.getCart();
    this.meta = this.cartSvc.getMeta();
  }

  // --- Totaux unifiés via service ---
  get subtotal(): number {
    return this.cartSvc.calcSubtotal(this.cart);
  }
  get discount(): number {
    return this.cartSvc.calcDiscount(this.subtotal, this.meta);
  }
  get shipping(): number {
    return this.cartSvc.calcShipping(this.subtotal, this.meta);
  }
  get total(): number {
    return this.cartSvc.calcTotal(this.subtotal, this.shipping, this.discount);
  }

  trackById = (_: number, item: CartItem) => item.id;

  dec(item: CartItem) {
    this.cartSvc.updateQuantity(item.id, item.quantity - 1);
    this.load();
  }

  inc(item: CartItem) {
    this.cartSvc.updateQuantity(item.id, item.quantity + 1);
    this.load();
  }

  async remove(item: CartItem) {
    const res = await Swal.fire({
      title: 'Supprimer cet article ?',
      text: item.name,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#dc2626',
    });
    if (res.isConfirmed) {
      this.cartSvc.removeFromCart(item.id);
      this.load();
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Article supprimé',
        timer: 1500,
        showConfirmButton: false,
        timerProgressBar: true,
      });
    }
  }

  clearAll() {
    this.cartSvc.clearCart();
    this.load();
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Panier vidé',
      timer: 1500,
      showConfirmButton: false,
      timerProgressBar: true,
    });
  }

  applyCoupon() {
    const code = (this.couponCode || '').trim().toUpperCase();
    if (!code) return;

    if (code === 'FREESHIP' || code === 'SALE10') {
      this.meta = this.cartSvc.setMeta({ couponCode: code });
      this.couponCode = '';
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: code === 'FREESHIP' ? 'Livraison offerte appliquée' : 'Remise 10% appliquée',
        timer: 1500,
        showConfirmButton: false,
      });
      this.load();
    } else {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Code invalide',
        timer: 1500,
        showConfirmButton: false,
      });
    }
  }

  clearCoupon() {
    this.meta = this.cartSvc.setMeta({ couponCode: '' });
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: 'Code promo retiré',
      timer: 1200,
      showConfirmButton: false,
    });
    this.load();
  }
}
