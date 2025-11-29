// src/app/services/fakestore.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export type FakeStoreItem = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: 'electronics' | 'jewelery' | "men's clothing" | "women's clothing";
  image: string;
  rating?: { rate: number; count: number };
};

@Injectable({ providedIn: 'root' })
export class FakeStore {
  private http = inject(HttpClient);
  private base = 'https://fakestoreapi.com';

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/products/categories`);
  }

  getAll(): Observable<FakeStoreItem[]> {
    return this.http.get<FakeStoreItem[]>(`${this.base}/products`);
  }
  getById(id: number) {
    return this.http.get<any>(`${this.base}/products/${id}`);
  }
}
