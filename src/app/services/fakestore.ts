// src/app/services/fakestore.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating?: { rate: number; count: number };
};

@Injectable({ providedIn: 'root' })
export class FakeStore {
  private http = inject(HttpClient);
  private readonly base = 'https://fakestoreapi.com';

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.base}/products`)
      .pipe(catchError(err => throwError(() => err)));
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/products/categories`)
      .pipe(catchError(err => throwError(() => err)));
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.base}/products/${id}`)
      .pipe(catchError(err => throwError(() => err)));
  }
}
