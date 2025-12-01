// src/app/services/product.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  _id: string;              // Mongo ID
  name: string;
  slug: string;
  description?: string;
  price: number;
  promoPrice?: number;
  category:
    | string
    | {
        _id: string;
        name: string;
        slug: string;
      };
  images?: string[];
  stock?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  createdAt?: string;
  rating?: number;          // ⭐ optionnel
}


@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000';

  getProducts(params?: {
    category?: string;
    search?: string;
    featured?: boolean;
  }): Observable<Product[]> {
    let httpParams = new HttpParams();

    if (params?.category) httpParams = httpParams.set('category', params.category);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.featured) httpParams = httpParams.set('featured', 'true');

    return this.http.get<Product[]>(`${this.apiUrl}/products`, { params: httpParams });
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }
}
