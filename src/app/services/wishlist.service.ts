import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';

export type WishItem = { id: number; title: string; price: number; image?: string };

const WL_PREFIX = 'app.wishlist.';
const GUEST_KEY = 'app.guestId';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private auth = inject(AuthService);

  // ------ clés & lecture/écriture
  private uid(): string {
    const u = this.auth.currentUser();
    if (u?.id) return String(u.id);
    let gid = sessionStorage.getItem(GUEST_KEY);
    if (!gid) { gid = crypto.randomUUID(); sessionStorage.setItem(GUEST_KEY, gid); }
    return `guest-${gid}`;
  }
  private key() { return WL_PREFIX + this.uid(); }
  private read(): WishItem[] {
    try { return JSON.parse(localStorage.getItem(this.key()) || '[]'); } catch { return []; }
  }
  private write(items: WishItem[]) {
    localStorage.setItem(this.key(), JSON.stringify(items));
    // événement “liste changée”
    window.dispatchEvent(new Event('wishlistUpdated'));
    // événement compteur absolu
    window.dispatchEvent(new CustomEvent('wishlistCountUpdated', { detail: { count: items.length }}));
  }

  // ------ API
  list(): WishItem[] { return this.read(); }
  isFavorite(id: number) { return this.read().some(i => i.id === id); }

  add(item: WishItem) {
    const cur = this.read();
    if (!cur.some(i => i.id === item.id)) {
      const next = [item, ...cur];
      this.write(next);
      // delta +1
      window.dispatchEvent(new CustomEvent('wishlistDelta', { detail: { delta: +1 }}));
    }
  }

  remove(id: number) {
    const cur = this.read();
    if (cur.some(i => i.id === id)) {
      const next = cur.filter(i => i.id !== id);
      this.write(next);
      // delta -1
      window.dispatchEvent(new CustomEvent('wishlistDelta', { detail: { delta: -1 }}));
    }
  }

  toggle(item: WishItem) {
    this.isFavorite(item.id) ? this.remove(item.id) : this.add(item);
  }

  clearAll() {
    const had = this.read().length;
    this.write([]);
    if (had) {
      window.dispatchEvent(new CustomEvent('wishlistDelta', { detail: { delta: -had }}));
    }
  }
}
