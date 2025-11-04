// src/app/features/checkout/order-success/order-success.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, RouterLink, Header, Footer],
  templateUrl: './order-success.html',
})
export class OrderSuccess implements OnInit {
  orderNumber = '';
  estimatedDelivery = '';

  ngOnInit(): void {
    // récupère ce que le Checkout peut passer via navigation extras
    const st = history.state as { orderNumber?: string; estimatedDelivery?: string };

    const number = st?.orderNumber ?? ('CMD' + Date.now());
    const eta = st?.estimatedDelivery
      ? new Date(st.estimatedDelivery)
      : (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d; })();

    this.orderNumber = number;
    this.estimatedDelivery = new Intl.DateTimeFormat('fr-FR').format(eta);
      window.scrollTo({ top: 0, behavior: 'smooth' });

  }
}
