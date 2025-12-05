// src/app/services/order.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// src/app/services/order.service.ts
export type OrderItem = {
  product: string;
  name: string;
  price: number;
  quantity: number;
};

export type Order = {
  _id: string;
  user?: string;
  items: OrderItem[];
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

export type OrderItemPayload = {
  productId: string;
  quantity: number;
};

export type ShippingAddressPayload = {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
};

export type CreateOrderPayload = {
  userId?: string | null;
  items: OrderItemPayload[];
  couponCode?: string;
  shippingAddress: ShippingAddressPayload;
  paymentMethod: 'CARD' | 'PAYPAL' | 'APPLEPAY' | 'GOOGLEPAY';
};

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000';


  private getAuthOptions() {
    const raw = localStorage.getItem('app.session');
    if (!raw) {
      console.warn('[OrderService] pas de app.session');
      return {};
    }

    try {
      const session = JSON.parse(raw);
      const token = session?.token;

      if (!token) {
        console.warn('[OrderService] app.session sans token');
        return {};
      }

      return {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`,
        }),
      };
    } catch (e) {
      console.error('[OrderService] parse app.session error', e);
      return {};
    }
  }

  getOrdersByUser(userId: string): Observable<Order[]> {
    return this.http.get<Order[]>(
      `${this.apiUrl}/orders/user/${userId}`,
      this.getAuthOptions()
    );
  }

  // POST /orders
  createOrder(payload: CreateOrderPayload): Observable<Order> {
    return this.http.post<Order>(
      `${this.apiUrl}/orders`,
      payload,
      this.getAuthOptions()
    );
  }



  // GET /orders (admin)
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(
      `${this.apiUrl}/orders`,
      this.getAuthOptions()
    );
  }

  // pour les compteurs
  getByUser(userId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/orders/user/${userId}`,
      this.getAuthOptions()
    );
  }
  cancelOrder(orderId: string): Observable<Order> {
  return this.http.patch<Order>(
    `${this.apiUrl}/orders/${orderId}/status`,
    { status: 'CANCELLED' },
    this.getAuthOptions()
  );
}

}
