import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth.service';
import { RouterLink } from '@angular/router';
type Order = {
  id: string;
  number: string;
  date: string;
  total: number;
  status: 'paid'|'processing'|'shipped'|'delivered'|'cancelled';
  userId: string|null;
  payment?: { method: 'card'|'paypal'|'applepay'|'googlepay'; last4?: string|null };
  items: { title:string; qty:number; price:number; image?:string }[];
};

const LS_ORDERS = 'app.orders';

@Component({
  standalone: true,
  selector: 'app-account-orders',
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.html'
})
export class AccountOrders implements OnInit {
  private auth = inject(AuthService);

  orders = signal<Order[]>([]);
  filter = signal<'all' | Order['status']>('all');

  ngOnInit(): void {
    const all: Order[] = JSON.parse(localStorage.getItem(LS_ORDERS) || '[]');
    const me = this.auth.currentUser();
    const mine = me ? all.filter(o => o.userId === me.id) : all.filter(o => o.userId == null);
    mine.sort((a,b) => (b.date > a.date ? 1 : -1));
    this.orders.set(mine);
  }

  displayed() {
    const f = this.filter();
    return this.orders().filter(o => f === 'all' ? true : o.status === f);
  }

  badgeClass(s: Order['status']) {
    return {
      paid:       'bg-indigo-100 text-indigo-800',
      processing: 'bg-amber-100 text-amber-800',
      shipped:    'bg-blue-100 text-blue-800',
      delivered:  'bg-emerald-100 text-emerald-800',
      cancelled:  'bg-rose-100 text-rose-800',
    }[s];
  }

  async confirmCancel(o: Order) {
    // règles : on autorise l’annulation si pas livré
    if (o.status === 'delivered') return;

    const res = await Swal.fire({
      icon: 'warning',
      title: 'Annuler cette commande ?',
      text: 'Cette action marquera la commande comme "Annulée".',
      showCancelButton: true,
      confirmButtonText: 'Oui, annuler',
      cancelButtonText: 'Non',
      confirmButtonColor: '#e11d48', // rose-600
    });

    if (!res.isConfirmed) return;

// 1) Mise à jour en mémoire
const next: Order[] = this.orders().map(x =>
  x.id === o.id ? { ...x, status: 'cancelled' as Order['status'] } : x
);
this.orders.set(next);

// 2) Persistance LS
const all: Order[] = JSON.parse(localStorage.getItem(LS_ORDERS) || '[]');
const idx = all.findIndex(x => x.id === o.id);
if (idx >= 0) {
  all[idx] = { ...all[idx], status: 'cancelled' as Order['status'] };
  localStorage.setItem(LS_ORDERS, JSON.stringify(all));
}


    Swal.fire({ icon: 'success', title: 'Commande annulée', timer: 1300, showConfirmButton: false });
  }
}
