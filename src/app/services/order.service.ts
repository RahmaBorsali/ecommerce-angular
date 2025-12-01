// src/app/services/order.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

export type Order = {
  _id: string;
  total: number;
  status: string;
  createdAt: string;
  // tu peux ajouter d'autres champs si tu veux
};

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000'; // comme ProductService

  createOrder(payload: CreateOrderPayload): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders`, payload);
  }

  getOrdersByUser(userId: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/user/${userId}`);
  }

  // Pour plus tard : admin
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders`);
  }
  getByUser(userId: string): Observable<any[]> {
    // adapte l’URL si besoin (ex: /orders/user/:id ou /orders?userId=)
    return this.http.get<any[]>(`${this.apiUrl}/orders/user/${userId}`);
  }
}
