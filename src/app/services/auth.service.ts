import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

// --------- Types ---------
export type User = {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  avatarUrl?: string | null;
  createdAt?: string;
  isVerified?: boolean;
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
  refreshToken: string;
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
            refreshToken: res.refreshToken,
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
         refreshToken: string;
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
  // ---------------- PROFILE ----------------

// GET /users/:id
getProfile(userId: string) {
  return this.http.get<User>(`${this.apiUrl}/users/${userId}`);
}

// PUT /users/:id
updateProfile(userId: string, data: any) {
  return this.http.put<User>(`${this.apiUrl}/users/${userId}`, data).pipe(
    tap((updated) => {
      this.updateSessionUser(updated);
    })
  );
}

uploadAvatar(userId: string, file: File) {
  const formData = new FormData();
  formData.append('avatar', file);

  return this.http
    .post<{ user: User }>(`${this.apiUrl}/users/${userId}/avatar`, formData)
    .pipe(
      tap((res) => {
        this.updateSessionUser(res.user);
      })
    );
}

// met à jour la session
private updateSessionUser(updated: User) {
  const session = this.readSession();
  if (!session) return;

  const normalized: User = {
    ...updated,
    id: (updated as any).id ?? (updated as any)._id ?? session.userId,
  };

  session.user = normalized;
  session.userId = normalized.id;

  localStorage.setItem(LS_SESSION, JSON.stringify(session));
  window.dispatchEvent(new Event('authChanged'));
}


  setCurrentUser(u: User) {
    this.updateSessionUser(u);
  }

}
