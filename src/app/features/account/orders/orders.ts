import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { OrderService } from '../../../services/order.service';   // ⬅️ important

// ---- Types venant du backend ----
type BackendOrderItem = {
  product: string;
  name: string;
  price: number;
  quantity: number;
};

type BackendOrder = {
  _id: string;
  user?: string;
  items: BackendOrderItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  couponCode?: string;
  shippingAddress?: any;
  paymentMethod: 'CARD' | 'PAYPAL' | 'APPLEPAY' | 'GOOGLEPAY';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  status: 'NEW' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
};

type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

type OrderVM = {
  id: string;
  number: string;
  date: string;
  total: number;
  status: OrderStatus;
  paymentMethod: 'card' | 'paypal' | 'applepay' | 'googlepay';
  items: { title: string; qty: number; price: number }[];
};

@Component({
  standalone: true,
  selector: 'app-account-orders',
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.html',
})
export class AccountOrders implements OnInit {
  private auth = inject(AuthService);
  private orderService = inject(OrderService);   // ⬅️ on injecte le service

  orders = signal<OrderVM[]>([]);
  filter = signal<'all' | OrderStatus>('all');
  loading = signal<boolean>(false);

  ngOnInit(): void {
    const me = this.auth.currentUser();
    if (!me?.id) {
      this.orders.set([]);
      return;
    }

    this.loading.set(true);

    // ⬅️ UTILISER le service (qui met le token)
    this.orderService.getOrdersByUser(me.id).subscribe({
      next: (list) => {
        const mapped = (list || []).map((o) => this.mapOrder(o));
        mapped.sort((a, b) => (b.date > a.date ? 1 : -1));
        this.orders.set(mapped);
      },
      error: (err) => {
        console.error('getOrdersByUser error', err);
        this.orders.set([]);
      },
      complete: () => this.loading.set(false),
    });
  }

  private mapOrder(o: BackendOrder): OrderVM {
    const status = o.status.toLowerCase() as OrderStatus;
    const paymentMethod = o.paymentMethod.toLowerCase() as OrderVM['paymentMethod'];

    const number = 'CMD-' + o._id.slice(-6).toUpperCase();

    return {
      id: o._id,
      number,
      date: o.createdAt,
      total: o.total,
      status,
      paymentMethod,
      items: (o.items || []).map((it) => ({
        title: it.name,
        qty: it.quantity,
        price: it.price,
      })),
    };
  }

  displayed(): OrderVM[] {
    const f = this.filter();
    return this.orders().filter((o) => (f === 'all' ? true : o.status === f));
  }

  badgeClass(s: OrderStatus) {
    return {
      new: 'bg-indigo-100 text-indigo-800',
      processing: 'bg-amber-100 text-amber-800',
      shipped: 'bg-blue-100 text-blue-800',
      delivered: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-rose-100 text-rose-800',
    }[s];
  }

  async confirmCancel(o: OrderVM) {
    if (o.status === 'delivered' || o.status === 'cancelled') return;

    const res = await Swal.fire({
      icon: 'warning',
      title: 'Annuler cette commande ?',
      text: 'Cette action marquera la commande comme "Annulée".',
      showCancelButton: true,
      confirmButtonText: 'Oui, annuler',
      cancelButtonText: 'Non',
      confirmButtonColor: '#e11d48',
    });

    if (!res.isConfirmed) return;

    // ⬅️ on ajoute une méthode cancelOrder dans OrderService (voir plus bas)
    this.orderService.cancelOrder(o.id).subscribe({
      next: () => {
        this.orders.update((list) =>
          list.map((x) =>
            x.id === o.id ? { ...x, status: 'cancelled' as OrderStatus } : x,
          ),
        );

        Swal.fire({
          icon: 'success',
          title: 'Commande annulée',
          timer: 1300,
          showConfirmButton: false,
        });
      },
      error: (err) => {
        console.error('cancel order error', err);
        Swal.fire({
          icon: 'error',
          title: "Impossible d'annuler la commande",
          timer: 1500,
          showConfirmButton: false,
        });
      },
    });
  }
}
