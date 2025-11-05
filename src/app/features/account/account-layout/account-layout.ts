import { CommonModule } from '@angular/common';
import { Component, computed, signal, effect, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Header } from "../../../shared/header/header";
import { Footer } from "../../../shared/footer/footer";
import { AuthService } from '../../../services/auth.service';

type NavItem = { icon: string; label: string; to: string; badge?: number };

// LS keys
const WL_PREFIX   = 'app.wishlist.';   // tableau d'ids produits
const ADDR_KEY    = 'app.addresses';   // tableau d'adresses { userId, ... }
const ORDERS_KEY  = 'app.orders';      // tableau de commandes { userId, ... }
const GUEST_KEY   = 'app.guestId';

@Component({
  standalone: true,
  selector: 'app-account-layout',
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, Header, Footer],
  template: `
  <app-header></app-header>

  <section class="min-h-[calc(100vh-80px)] bg-gradient-to-br from-blue-50 via-white to-blue-100">
    <div class="container mx-auto px-4 py-8">
      <div class="grid gap-6 lg:grid-cols-[280px_1fr]">

        <!-- SIDEBAR -->
        <aside class="space-y-3">
          <a
            *ngFor="let item of nav()"
            [routerLink]="item.to"
            routerLinkActive="!bg-blue-600 !text-white !shadow-lg"
            [routerLinkActiveOptions]="{ exact: true }"
            class="group flex items-center justify-between rounded-2xl bg-white text-gray-800 px-4 py-4 shadow-sm border border-gray-100
                   hover:shadow-md hover:translate-y-[-1px] transition-all"
          >
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 grid place-items-center
                          group-[.router-link-active]:bg-white/20 group-[.router-link-active]:text-white">
                <i [class]="item.icon + ' text-lg'"></i>
              </div>
              <div class="font-medium">{{ item.label }}</div>
            </div>

            <span *ngIf="item.badge != null"
              class="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700
                     group-[.router-link-active]:bg-white/20 group-[.router-link-active]:text-white">
              {{ item.badge }}
            </span>
          </a>

          <button
            (click)="logout()"
            class="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-3 font-semibold shadow-md hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:scale-[1.03] transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
          >
            <i class="icon-logout text-lg animate-pulse"></i>
            <span>Déconnexion</span>
          </button>
        </aside>

        <!-- CONTENT WRAPPER -->
        <main class="rounded-3xl bg-white/80 backdrop-blur border border-gray-200/60 shadow-xl overflow-hidden">
          <div class="flex items-center justify-between px-6 sm:px-8 py-5 border-b bg-gradient-to-r from-white to-blue-50">
            <div>
              <h1 class="text-2xl md:text-3xl font-bold">{{ title() }}</h1>
              <p class="text-sm text-gray-500">Gérez votre espace personnel</p>
            </div>
            <ng-content select="[account-actions]"></ng-content>
          </div>

          <div class="p-6 sm:p-8">
            <router-outlet />
          </div>
        </main>

      </div>
    </div>
  </section>

  <app-footer></app-footer>
  `
})
export class AccountLayout {
  private router = inject(Router);
  private auth   = inject(AuthService);

  // route courante -> titre
  private currentPath = signal<string>(this.router.url);

  // compteurs
  private wishCount  = signal<number>(0);
  private addrCount  = signal<number>(0);
  private orderCount = signal<number>(0);

  nav = signal<NavItem[]>([
    { icon: 'icon-user',    label: 'Informations', to: '/account/profile' },
    { icon: 'icon-archive', label: 'Commandes',    to: '/account/orders',    badge: 0 },
    { icon: 'icon-map-pin', label: 'Adresses',     to: '/account/addresses', badge: 0 },
    { icon: 'icon-heart',   label: 'Favoris',      to: '/account/wishlist',  badge: 0 },
  ]);

  constructor() {
    // maj titre
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => this.currentPath.set(e.urlAfterRedirects));

    // charge compteurs init
    this.refreshAllCounters();

    // écoute changements (même onglet / autres onglets)
    window.addEventListener('storage', (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key.startsWith(WL_PREFIX) || e.key === ADDR_KEY || e.key === ORDERS_KEY) {
        this.refreshAllCounters();
      }
    });
    window.addEventListener('authChanged', () => this.refreshAllCounters());

    // events custom émis ailleurs dans l’app
    window.addEventListener('wishlistCountUpdated', () => this.refreshWishlist());
    window.addEventListener('addressesUpdated',     () => this.refreshAddresses());
    window.addEventListener('ordersUpdated',        () => this.refreshOrders());

    // projette les compteurs dans les badges
    effect(() => {
      const w = this.wishCount();
      const a = this.addrCount();
      const o = this.orderCount();
      this.nav.update(list =>
        list.map(it => {
          if (it.to === '/account/wishlist')  return { ...it, badge: w };
          if (it.to === '/account/addresses') return { ...it, badge: a };
          if (it.to === '/account/orders')    return { ...it, badge: o };
          return it;
        })
      );
    });
  }

  // ----- Titre dynamique
  title = computed(() => {
    const path = this.currentPath();
    if (path.endsWith('/profile'))   return 'Informations Personnelles';
    if (path.endsWith('/orders'))    return 'Historique des Commandes';
    if (path.endsWith('/addresses')) return 'Adresses';
    if (path.endsWith('/wishlist'))  return 'Mes Favoris';
    return 'Mon Compte';
  });

  // ----- Helpers UID & clés
  private uid(): string {
    const u = this.auth.currentUser();
    if (u?.id) return String(u.id);
    let gid = sessionStorage.getItem(GUEST_KEY);
    if (!gid) { gid = crypto.randomUUID(); sessionStorage.setItem(GUEST_KEY, gid); }
    return `guest-${gid}`;
  }
  private wlKey(): string {
    return WL_PREFIX + this.uid();
  }

  // ----- Lecture compteurs
  private refreshWishlist() {
    try {
      const arr = JSON.parse(localStorage.getItem(this.wlKey()) || '[]');
      this.wishCount.set(Array.isArray(arr) ? arr.length : 0);
    } catch { this.wishCount.set(0); }
  }
  private refreshAddresses() {
    try {
      const uid = this.auth.currentUser()?.id ?? null;
      const arr = JSON.parse(localStorage.getItem(ADDR_KEY) || '[]') as any[];
      const mine = Array.isArray(arr) ? arr.filter(a => String(a.userId ?? '') === String(uid ?? '')) : [];
      this.addrCount.set(mine.length);
    } catch { this.addrCount.set(0); }
  }
  private refreshOrders() {
    try {
      const uid = this.auth.currentUser()?.id ?? null;
      const arr = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]') as any[];
      const mine = Array.isArray(arr) ? arr.filter(o => String(o.userId ?? '') === String(uid ?? '')) : [];
      this.orderCount.set(mine.length);
    } catch { this.orderCount.set(0); }
  }
  private refreshAllCounters() {
    this.refreshWishlist();
    this.refreshAddresses();
    this.refreshOrders();
  }

  // ----- Déconnexion
  logout() {
  try {
    // Supprime uniquement la session (sans effacer les autres données)
    localStorage.removeItem('app.session');
    window.dispatchEvent(new Event('authChanged'));
  } finally {
    // 🔁 Redirige vers la page d’accueil
    this.router.navigateByUrl('/');
  }
}

}
