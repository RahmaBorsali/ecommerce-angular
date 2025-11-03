import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { RouterLink } from '@angular/router';

type Order = {
  id: string;
  number: string;
  userId: string;
  date: string;
  total: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: { title: string; qty: number; price: number; image?: string }[];
};

const LS_ORDERS = 'app.orders'; // clé localStorage

@Component({
  standalone: true,
  selector: 'app-account-orders',
  imports: [CommonModule,RouterLink],
  templateUrl: './orders.html',
})
export class AccountOrders implements OnInit {
  private auth = inject(AuthService);

  orders = signal<Order[]>([]);
  filter = signal<'all' | Order['status']>('all');

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (!user) {
      this.orders.set([]);
      return;
    }

    try {
      const raw = localStorage.getItem(LS_ORDERS);
      const allOrders: Order[] = raw ? JSON.parse(raw) : [];

      // ✅ on garde uniquement les commandes du user connecté
      const myOrders = allOrders.filter(
        (o) => String(o.userId) === String(user.id)
      );

      // facultatif : ne garder que les “réelles” (ex: payées)
      this.orders.set(myOrders.filter(o => o.status !== 'cancelled'));
    } catch {
      this.orders.set([]);
    }
  }

  /** 🔍 Retourne les commandes filtrées selon l’onglet actif */
  displayed = computed(() => {
    const f = this.filter();
    return this.orders().filter((o) => (f === 'all' ? true : o.status === f));
  });

  /** 🎨 Couleur de badge selon le statut */
  badgeClass(s: Order['status']) {
    return {
      processing: 'bg-amber-100 text-amber-800',
      shipped: 'bg-blue-100 text-blue-800',
      delivered: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-rose-100 text-rose-800',
    }[s];
  }
}
