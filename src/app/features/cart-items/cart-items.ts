// src/app/features/cart/cart-items.component.ts
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart-items',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart-items.html',
})
export class CartItems implements OnInit, OnDestroy {
  private cartSvc = inject(CartService);

  cart: CartItem[] = [];
  readonly SHIPPING_FEE = 9.99; // DT

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
    return this.subtotal > 0 ? this.SHIPPING_FEE : 0;
  }

  get total(): number {
    return this.subtotal + this.shipping;
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
}
