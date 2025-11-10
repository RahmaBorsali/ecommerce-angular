import { Injectable } from '@angular/core';

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string; // stocké encodé (démo)
  address: string;
  createdAt: string;
};

const LS_USERS = 'app.users';
const LS_SESSION = 'app.session';
const CART_PREFIX = 'app.cart.';
const META_PREFIX = 'app.cartmeta.';
@Injectable({ providedIn: 'root' })
export class AuthService {
  // --------- Public API ----------
  register(data: Omit<User, 'id' | 'createdAt' | 'password'> & { password: string }): User {
    const users = this.readUsers();
    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error('EMAIL_EXISTS');
    }
    const user: User = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      password: btoa(data.password), // démo
    };
    this.writeUsers([...users, user]);
    return user;
  }

  login(email: string, password: string): User {
    const users = this.readUsers();
    const u = users.find((x) => x.email.toLowerCase() === email.toLowerCase());
    if (!u) throw new Error('NOT_FOUND');
    if (u.password !== btoa(password)) throw new Error('BAD_CREDENTIALS');
    localStorage.setItem(LS_SESSION, JSON.stringify({ userId: u.id }));
    return u;
    window.dispatchEvent(new Event('authChanged'));
  }

  logout() {
    const session = this.readSession();
    if (session?.userId) {
      // Efface le panier du user
      localStorage.removeItem(`${CART_PREFIX}${session.userId}`);
      localStorage.removeItem(`${META_PREFIX}${session.userId}`);
    }

    //  Efface la session
    localStorage.removeItem(LS_SESSION);

    // notifier le reste de l’app
    window.dispatchEvent(new Event('cartUpdated'));
    window.dispatchEvent(new Event('authChanged'));
  }

  currentUser(): User | null {
    const session = this.readSession();
    if (!session) return null;
    const users = this.readUsers();
    return users.find((u) => u.id === session.userId) ?? null;
  }

  // --------- Storage helpers ----------
  private readUsers(): User[] {
    try {
      return JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    } catch {
      return [];
    }
  }
  private writeUsers(users: User[]) {
    localStorage.setItem(LS_USERS, JSON.stringify(users));
  }
  private readSession(): { userId: string } | null {
    try {
      return JSON.parse(localStorage.getItem(LS_SESSION) || 'null');
    } catch {
      return null;
    }
  }
  // Vérifie s’il existe une session active
  isLoggedIn(): boolean {
    const session = localStorage.getItem('app.session');
    try {
      const parsed = JSON.parse(session || 'null');
      return !!(parsed && parsed.userId);
    } catch {
      return false;
    }
  }
}
