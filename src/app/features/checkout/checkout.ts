import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { CartService, CartItem, CartMeta } from '../../services/cart.service';
import { Footer } from '../../shared/footer/footer';
import { Header } from '../../shared/header/header';
import { cardNumber } from '../../utils/card-number';
import { AuthService } from '../../services/auth.service'; // + import

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Footer, Header],
  templateUrl: './checkout.html',
})
export class Checkout implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly cartSvc = inject(CartService);

  step = 1;
  loading = false;

  cart: CartItem[] = [];
  meta: CartMeta = this.cartSvc.getMeta();
  method: 'card' | 'paypal' | 'applepay' | 'googlepay' = 'card';

  // Étape 1
  step1 = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    address: ['', Validators.required],
    city: ['', Validators.required],
    postalCode: ['', Validators.required],
    phone: ['', Validators.required],
    useExpress: [false],
  });

  // Étape 2
  step2 = this.fb.nonNullable.group({
    cardNumber: ['', [Validators.required, cardNumber]],
    cardName: ['', Validators.required],
    expiryDate: ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]], // MM/AA
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
  });

  private onCartUpdated = () => {
    this.cart = this.cartSvc.getCart();
    this.meta = this.cartSvc.getMeta(); // récupère le coupon aussi
  };
  formatCardNumber(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const raw = (input.value || '').replace(/\D+/g, '').slice(0, 19);
    input.value = raw.replace(/(.{4})/g, '$1 ').trim();
    // mettre à jour le formcontrol sans déclencher validation redondante
    this.step2.controls.cardNumber.setValue(input.value, { emitEvent: false });
  }

  ngOnInit(): void {
    this.cart = this.cartSvc.getCart();
    this.meta = this.cartSvc.getMeta();

    if (!this.cart.length) {
      // Ne pas reset le coupon ici — on laisse l’état global jusqu’au paiement
      this.router.navigate(['/cart']);
      return;
    }

    window.addEventListener('cartUpdated', this.onCartUpdated);
    window.addEventListener('storage', this.onCartUpdated);
  }

  ngOnDestroy(): void {
    window.removeEventListener('cartUpdated', this.onCartUpdated);
    window.removeEventListener('storage', this.onCartUpdated);
  }

  // Totaux via service (identiques au panier)
  get subtotal() {
    return this.cartSvc.calcSubtotal(this.cart);
  }
  get discount() {
    return this.cartSvc.calcDiscount(this.subtotal, this.meta);
  }
  get shipping() {
    const express = this.step1.controls.useExpress.value === true;
    return this.cartSvc.calcShipping(this.subtotal, this.meta, { express });
  }
  get total() {
    return this.cartSvc.calcTotal(this.subtotal, this.shipping, this.discount);
  }

  nextFromStep1() {
    if (this.step1.invalid) {
      this.step1.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Champs manquants',
        text: 'Merci de compléter vos informations.',
      });
      return;
    }
    this.step = 2;
  }
  backToStep1() {
    this.step = 1;
  }

  // +++ sous step2 +++
  paypalForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  walletForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required]],
  });

  selectMethod(m: 'card' | 'paypal' | 'applepay' | 'googlepay') {
    this.method = m;
  }

  // if (m === 'card') { this.paypalForm.reset(); this.walletForm.reset(); }
  // if (m === 'paypal') { this.step2.reset(); this.walletForm.reset(); }
  // if (m === 'applepay' || m === 'googlepay') { this.step2.reset(); this.paypalForm.reset(); }

  async pay() {
    if (this.step2.invalid) {
      this.step2.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Informations de carte invalides',
        text: 'Merci de vérifier vos informations bancaires.',
      });
      return;
    }

    this.loading = true;

    Swal.fire({
      title: 'Paiement en cours…',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
      showConfirmButton: false,
      backdrop: true,
    });

    setTimeout(() => {
      Swal.close();

      try {
        const LS_ORDERS = 'app.orders';
        const orders = JSON.parse(localStorage.getItem(LS_ORDERS) || '[]');

        const number =
          'ES-' +
          new Date().toISOString().slice(0, 10).replace(/-/g, '') +
          '-' +
          String(Math.floor(Math.random() * 10000)).padStart(4, '0');

        const order = {
          id: crypto.randomUUID(),
          number,
          date: new Date().toISOString(),
          total: this.total,
          status: 'processing',
          userId: this.auth?.currentUser()?.id ?? null,
          items: this.cart.map((it) => ({
            title: it.name,
            qty: it.quantity,
            price: it.price,
            image: it.image,
          })),
        };

        orders.unshift(order);
        localStorage.setItem(LS_ORDERS, JSON.stringify(orders));
      } catch {}

      this.cartSvc.clearCart();
      this.cartSvc.setMeta({ couponCode: '' });

      Swal.fire({
        icon: 'success',
        title: 'Commande confirmée ✅',
        text: 'Merci pour votre achat !',
      });

      const orderNumber =
        'ES-' +
        new Date().toISOString().slice(0, 10).replace(/-/g, '') +
        '-' +
        String(Math.floor(Math.random() * 10000)).padStart(4, '0');

      const eta = new Date();
      eta.setDate(eta.getDate() + 7);

      this.router.navigate(['/order/success'], {
        state: {
          orderNumber,
          estimatedDelivery: eta.toISOString(),
        },
      });

      this.loading = false;
    }, 1500);
  }

  onImgError(ev: Event, item: CartItem) {
    const el = ev.target as HTMLImageElement;
    if (item.image?.includes('images.unsplash.com') && !el.src.includes('w=')) {
      el.src = item.image + (item.image.includes('?') ? '&' : '?') + 'auto=format&w=200&q=60';
    } else {
      el.src = 'assets/placeholder-100x100.png';
    }
  }
}
