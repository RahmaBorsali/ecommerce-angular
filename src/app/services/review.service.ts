import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BackendReview {
  _id: string;
  product: string; // ObjectId string
  user?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000';

  // GET /reviews/product/:productId
  getByProduct(productId: string): Observable<BackendReview[]> {
    return this.http.get<BackendReview[]>(`${this.apiUrl}/reviews/product/${productId}`);
  }

  // POST /reviews
  // body: { productId, userId?, rating, comment }
  create(payload: {
    productId: string;
    userId?: string;
    rating: number;
    comment: string;
  }): Observable<BackendReview> {
    return this.http.post<BackendReview>(`${this.apiUrl}/reviews`, payload);
  }

  // DELETE /reviews/:id (si tu en as besoin plus tard)
  delete(id: string) {
    return this.http.delete(`${this.apiUrl}/reviews/${id}`);
  }
}
