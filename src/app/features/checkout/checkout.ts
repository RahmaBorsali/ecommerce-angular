// src/app/features/checkout/checkout.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { CartService, CartItem } from '../../services/cart.service';
import { Footer } from '../../shared/footer/footer';
import { Header } from '../../shared/header/header';

type DeliveryKey = 'express';
@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Footer, Header],
  templateUrl: './checkout.html'
})
export class Checkout implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private cartSvc = inject(CartService);

  step = 1;
  loading = false;

  cart: CartItem[] = [];
  meta = this.cartSvc.getMeta();

  // Étape 1
  step1 = this.fb.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
    address:   ['', Validators.required],
    city:      ['', Validators.required],
    postalCode:['', Validators.required],
    phone:     ['', Validators.required],
    useExpress: [false],
  });

  // Étape 2
  step2 = this.fb.group({
    cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
    cardName:   ['', Validators.required],
    expiryDate: ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]], // MM/AA
    cvv:        ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
  });

  // ----> important : recharger quand le panier change (sans refresh)
  private onCartUpdated = () => {
    this.cart = this.cartSvc.getCart();
    this.meta = this.cartSvc.getMeta();
  };

  ngOnInit(): void {
    this.cart = this.cartSvc.getCart();      // ← affiche tout de suite
    this.meta = this.cartSvc.getMeta();
    if (!this.cart.length) { this.router.navigate(['/cart']); return; }
    window.addEventListener('cartUpdated', this.onCartUpdated);
    window.addEventListener('storage', this.onCartUpdated);
  }

  ngOnDestroy(): void {
    window.removeEventListener('cartUpdated', this.onCartUpdated);
    window.removeEventListener('storage', this.onCartUpdated);
  }

  // Totaux partagés (mêmes que CartItems)
  get subtotal() { return this.cartSvc.calcSubtotal(this.cart); }
  get shipping()  { return this.step1.controls.useExpress.value ? 4 : 0; }
  get total() { return this.cartSvc.calcTotal(this.subtotal, this.shipping, this.meta.discount || 0); }

  nextFromStep1() {
    if (this.step1.invalid) {
      this.step1.markAllAsTouched();
      Swal.fire({ icon:'warning', title:'Champs manquants', text:'Merci de compléter vos informations.' });
      return;
    }
    this.step = 2;
  }
  backToStep1() { this.step = 1; }

  async pay() {
    if (this.step2.invalid) {
      this.step2.markAllAsTouched();
      Swal.fire({ icon: 'warning', title: 'Informations de carte invalides', text: 'Merci de vérifier vos informations bancaires.' });
      return;
    }
    this.loading = true;
    await Swal.fire({ title: 'Paiement en cours...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    setTimeout(() => {
      Swal.close();
      Swal.fire({ icon: 'success', title: 'Commande confirmée ✅', text: 'Merci pour votre achat !' });
      this.cartSvc.clearCart();
      this.router.navigate(['/']);
    }, 1500);
  }

  // fallback image pour éviter les carrés vides
  onImgError(ev: Event, item: CartItem) {
    const el = ev.target as HTMLImageElement;
    if (item.image?.includes('images.unsplash.com') && !el.src.includes('w=')) {
      el.src = item.image + (item.image.includes('?') ? '&' : '?') + 'auto=format&w=200&q=60';
    } else {
      el.src = 'assets/placeholder-100x100.png';
    }
  }
}
