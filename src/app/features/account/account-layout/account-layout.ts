import { CommonModule } from '@angular/common';
import { Component, computed, signal, effect, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { AuthService } from '../../../services/auth.service';
import { WishlistService } from '../../../services/wishlist.service';
import { AddressService } from '../../../services/address.service';
import { OrderService } from '../../../services/order.service';

type NavItem = { icon: string; label: string; to: string; badge?: number };

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
                <div
                  class="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 grid place-items-center
                            group-[.router-link-active]:bg-white/20 group-[.router-link-active]:text-white"
                >
                  <i [class]="item.icon + ' text-lg'"></i>
                </div>
                <div class="font-medium">{{ item.label }}</div>
              </div>

              <span
                *ngIf="item.badge != null"
                class="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700
                           group-[.router-link-active]:bg-white/20 group-[.router-link-active]:text-white"
              >
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
          <main
            class="rounded-3xl bg-white/80 backdrop-blur border border-gray-200/60 shadow-xl overflow-hidden"
          >
            <div
              class="flex items-center justify-between px-6 sm:px-8 py-5 border-b bg-gradient-to-r from-white to-blue-50"
            >
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
  `,
})
export class AccountLayout {
  private router = inject(Router);
  private auth = inject(AuthService);
  private wishApi = inject(WishlistService);
  private addrApi = inject(AddressService);
  private orderApi = inject(OrderService);

  private currentPath = signal<string>(this.router.url);

  private wishCount = signal<number>(0);
  private addrCount = signal<number>(0);
  private orderCount = signal<number>(0);

  nav = signal<NavItem[]>([
    { icon: 'icon-user', label: 'Informations', to: '/account/profile' },
    { icon: 'icon-archive', label: 'Commandes', to: '/account/orders', badge: 0 },
    { icon: 'icon-map-pin', label: 'Adresses', to: '/account/addresses', badge: 0 },
    { icon: 'icon-heart', label: 'Favoris', to: '/account/wishlist', badge: 0 },
  ]);

  constructor() {
    // titre dynamique
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: any) => this.currentPath.set(e.urlAfterRedirects));

    // premier chargement des compteurs
    this.refreshAllCounts();

    // 🔔 quand la session change → on recharge les compteurs
    window.addEventListener('authChanged', () => this.refreshAllCounts());

    // 🔔 quand les données changent → on ne recalcule QUE ce compteur
    window.addEventListener('wishlistUpdated', () => this.refreshWishlistCount());
    window.addEventListener('addressesUpdated', () => this.refreshAddressCount());
    window.addEventListener('ordersUpdated', () => this.refreshOrderCount());

    // projection des signaux dans le menu
    effect(() => {
      const w = this.wishCount();
      const a = this.addrCount();
      const o = this.orderCount();
      this.nav.update((list) =>
        list.map((it) => {
          if (it.to === '/account/wishlist') return { ...it, badge: w };
          if (it.to === '/account/addresses') return { ...it, badge: a };
          if (it.to === '/account/orders') return { ...it, badge: o };
          return it;
        })
      );
    });
  }

  title = computed(() => {
    const path = this.currentPath();
    if (path.endsWith('/profile')) return 'Informations Personnelles';
    if (path.endsWith('/orders')) return 'Historique des Commandes';
    if (path.endsWith('/addresses')) return 'Adresses';
    if (path.endsWith('/wishlist')) return 'Mes Favoris';
    return 'Mon Compte';
  });

  // --------- Compteurs ---------

  private refreshAllCounts() {
    this.refreshWishlistCount();
    this.refreshAddressCount();
    this.refreshOrderCount();
  }

  private refreshWishlistCount() {
    const u = this.auth.currentUser();


    const localCount = this.wishApi.list().length;
    this.wishCount.set(localCount);

    if (!u?.id) {
      return;
    }

    this.wishApi.getByUser(u.id).subscribe({
      next: (res: any) => {

        const items = Array.isArray(res) ? res : res.items ?? res.products ?? res.wishlist ?? [];

        this.wishCount.set(items.length || 0);
      },
      error: (err) => {
        console.error('wishlist count error', err);
        // en cas d’erreur on garde au moins la valeur locale
        this.wishCount.set(localCount);
      },
    });
  }

  private refreshAddressCount() {
    const u = this.auth.currentUser();
    if (!u?.id) {
      this.addrCount.set(0);
      return;
    }

    this.addrApi.getByUser(u.id).subscribe({
      next: (items: any[]) => this.addrCount.set(items.length || 0),
      error: (err) => {
        console.error('address count error', err);
        this.addrCount.set(0);
      },
    });
  }

  private refreshOrderCount() {
    const u = this.auth.currentUser();
    if (!u?.id) {
      this.orderCount.set(0);
      return;
    }

    this.orderApi.getByUser(u.id).subscribe({
      next: (items: any[]) => this.orderCount.set(items.length || 0),
      error: (err) => {
        console.error('order count error', err);
        this.orderCount.set(0);
      },
    });
  }

  // --------- Déconnexion ---------
  logout() {
    try {
      localStorage.removeItem('app.session');
      window.dispatchEvent(new Event('authChanged'));
    } finally {
      this.router.navigateByUrl('/');
    }
  }
}
