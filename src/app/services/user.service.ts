import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './auth.service';

export type UserProfile = User & {
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  avatarUrl?: string | null;
};

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000';

  getProfile(id: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/users/${id}`);
  }

  updateProfile(id: string, patch: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/users/${id}`, patch);
  }

  updateAvatar(id: string, file: File): Observable<UserProfile> {
    const fd = new FormData();
    fd.append('avatar', file);
    return this.http.put<UserProfile>(`${this.apiUrl}/users/${id}/avatar`, fd);
  }
}
