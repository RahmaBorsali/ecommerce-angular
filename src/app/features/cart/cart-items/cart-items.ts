// src/app/features/cart/cart-items.component.ts
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { CartService, CartItem } from '../../../services/cart.service';
import { Header } from "../../../shared/header/header";
import { Footer } from "../../../shared/footer/footer";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cart-items',
  standalone: true,
  imports: [CommonModule, RouterLink, Header, Footer,FormsModule],
  templateUrl: './cart-items.html',
})
export class CartItems implements OnInit, OnDestroy {
  Math = Math;
  private cartSvc = inject(CartService);

  cart: CartItem[] = [];
  readonly SHIPPING_FEE = 8 ;
  readonly FREE_SHIPPING_THRESHOLD = 10000; 
  discount = 0;
  couponCode = '';

  private onCartUpdated = () => this.loadCart();
  private onStorage = (e: StorageEvent) => {
    if (e.key === 'cart' || e.key === null) this.loadCart();
  };

  ngOnInit(): void {
    this.loadCart();
    // sync interne + multi-onglet
    window.addEventListener('cartUpdated', this.onCartUpdated);
    window.addEventListener('storage', this.onStorage);
  }

  ngOnDestroy(): void {
    window.removeEventListener('cartUpdated', this.onCartUpdated);
    window.removeEventListener('storage', this.onStorage);
  }

  loadCart() {
    this.cart = this.cartSvc.getCart();
  }

  get subtotal(): number {
    return this.cart.reduce((s, i) => s + i.price * i.quantity, 0);
  }

  get shipping(): number {
    if (this.subtotal >= this.FREE_SHIPPING_THRESHOLD) return 0;
    return this.subtotal > 0 ? this.SHIPPING_FEE : 0;
  }

  get total(): number {
    return Math.max(0, this.subtotal - this.discount) + this.shipping;
  }

  trackById = (_: number, item: CartItem) => item.id;

  dec(item: CartItem) {
    const newQty = item.quantity - 1;
    this.cartSvc.updateQuantity(item.id, newQty);
    this.loadCart();
  }

  inc(item: CartItem) {
    const newQty = item.quantity + 1;
    this.cartSvc.updateQuantity(item.id, newQty);
    this.loadCart();
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
      this.loadCart();
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
    this.loadCart();
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

    if (code === 'FREESHIP') {
      this.discount = 0;
      this.couponCode = '';
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Livraison offerte appliquée', timer: 1500, showConfirmButton: false });
    } else if (code === 'SALE10') {
      // 10% du sous-total
      this.discount = +(this.subtotal * 0.10).toFixed(2);
      this.couponCode = '';
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Remise 10% appliquée', timer: 1500, showConfirmButton: false });
    } else {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Code invalide', timer: 1500, showConfirmButton: false });
    }
  }

}
