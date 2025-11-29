import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

// --------- Types ---------
export type User = {
  id: string;          // toujours défini côté front
  _id?: string;        // au cas où le backend renvoie _id
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  createdAt?: string;
  isVerified?: boolean;
  // on NE garde PAS password ici en front pour le user connecté
};

export type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  password: string;
};

export type LoginResponse = {
  user: User;
  token: string;
};

const LS_SESSION = 'app.session';
const CART_PREFIX = 'app.cart.';
const META_PREFIX = 'app.cartmeta.';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000';

  // ================== REGISTER (BACKEND) ==================
  register(data: RegisterPayload): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/auth/signup`,
      data
    );
  }

  // ================== LOGIN (pour plus tard, backend) ==================
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          const rawUser = res.user as any;
          const userId: string = (rawUser.id ?? rawUser._id) as string;

          const normalizedUser: User = {
            ...rawUser,
            id: userId,
          };

          const session = {
            userId,
            token: res.token,
            user: normalizedUser,
          };

          localStorage.setItem(LS_SESSION, JSON.stringify(session));
          window.dispatchEvent(new Event('authChanged'));

          res.user = normalizedUser;
        })
      );
  }

  // ================== LOGOUT ==================
  logout() {
    const session = this.readSession();
    if (session?.userId) {
      localStorage.removeItem(`${CART_PREFIX}${session.userId}`);
      localStorage.removeItem(`${META_PREFIX}${session.userId}`);
    }

    localStorage.removeItem(LS_SESSION);

    window.dispatchEvent(new Event('cartUpdated'));
    window.dispatchEvent(new Event('authChanged'));
  }

  // ================== CURRENT USER ==================
  currentUser(): User | null {
    const session = this.readSession();
    return session?.user ?? null;
  }

  // ================== SESSION HELPERS ==================
  private readSession():
    | {
        userId: string;
        token: string;
        user: User;
      }
    | null {
    try {
      return JSON.parse(localStorage.getItem(LS_SESSION) || 'null');
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    const session = this.readSession();
    return !!(session && session.token);
  }
}
