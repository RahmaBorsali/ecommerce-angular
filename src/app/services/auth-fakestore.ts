import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

type FakeStoreLoginReq = { username: string; password: string };
type FakeStoreLoginRes = { token: string };
@Injectable({ providedIn: 'root' })
export class AuthFakeStore {
  private baseUrl = 'https://fakestoreapi.com';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<{ token: string }> {
    const body: FakeStoreLoginReq = { username, password };
    return this.http.post<FakeStoreLoginRes>(`${this.baseUrl}/auth/login`, body).pipe(
      map((res) => {
        if (!res?.token) throw new Error('Token manquant');
        return { token: res.token };
      }),
      catchError((err) => {
        return throwError(() => new Error(err?.error || 'Échec de connexion'));
      })
    );
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }
}
