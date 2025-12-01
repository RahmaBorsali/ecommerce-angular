import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type Address = {
  _id: string;
  user: string;          // id Mongo de l'utilisateur
  label?: string;
  firstName: string;
  lastName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateAddressDto = {
  userId: string;
  label?: string;
  firstName: string;
  lastName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country?: string;
  isDefault?: boolean;
};

@Injectable({ providedIn: 'root' })
export class AddressService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000';

  // GET /addresses/user/:userId
  getByUser(userId: string): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.apiUrl}/addresses/user/${userId}`);
    
  }

  // POST /addresses
  create(dto: CreateAddressDto): Observable<Address> {
    return this.http.post<Address>(`${this.apiUrl}/addresses`, dto);
  }

  // PATCH /addresses/:id
  update(id: string, patch: Partial<Omit<CreateAddressDto, 'userId'>>): Observable<Address> {
    return this.http.patch<Address>(`${this.apiUrl}/addresses/${id}`, patch);
  }

  // DELETE /addresses/:id
  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/addresses/${id}`);
  }

  // PATCH /addresses/:id/default
  setDefault(id: string): Observable<Address> {
    return this.http.patch<Address>(`${this.apiUrl}/addresses/${id}/default`, {});
  }


}
