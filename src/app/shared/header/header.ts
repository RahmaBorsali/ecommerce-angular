import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, HostListener, ElementRef } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit, OnDestroy {
  logoUrl = 'assets/logo.png';
  searchQuery = '';
  cartCount = 0;
  isMenuOpen = false;
  isLoggedIn = false;
  isSearchOpen = false;
  avatarUrl: string | null = null;

  private el = inject(ElementRef);

  currentUser: User | null = null;
  constructor(private router: Router) {}
  private auth = inject(AuthService);
  private onAuthChanged = () => this.refreshAuth();
  private onCartEvents = () => this.updateCartCount();

  ngOnInit(): void {
    this.updateCartCount();
    this.refreshAuth();                                // 👈 initialise l’état
    window.addEventListener('authChanged', this.onAuthChanged); // 👈 NEW
    window.addEventListener('cartUpdated', this.onCartEvents as EventListener);
  }

  ngOnDestroy(): void {
    window.removeEventListener('authChanged', this.onAuthChanged); // 👈 NEW
    window.removeEventListener('cartUpdated', this.onCartEvents as EventListener);
  }

  private refreshAuth(): void {
    this.isLoggedIn = this.auth.isLoggedIn();          // 👈 basé sur app.session
    this.currentUser = this.auth.currentUser();        // (peut être null si app.users vide)
  }

  goToAccount(): void {
    this.refreshAuth();                                // rafraîchit avant de router
    this.router.navigate([ this.isLoggedIn ? '/account/profile' : '/auth/signin' ]);
  }


  // 👇 NEW: récupère l’utilisateur courant selon les clés courantes
  private getCurrentUser():
    | { id: string | number; email: string; avatarUrl?: string }
    | null
  {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]') as any[];
      // 1) authUserId + users
      const id = localStorage.getItem('authUserId');
      if (id && Array.isArray(users) && users.length) {
        const byId = users.find(u => String(u.id) === String(id));
        if (byId) return byId;
      }
      // 2) authUser direct
      const authUserRaw = localStorage.getItem('authUser');
      if (authUserRaw) {
        const authUser = JSON.parse(authUserRaw);
        // merge avec users si possible
        if (Array.isArray(users) && users.length) {
          const fromList = users.find(u => String(u.id) === String(authUser.id));
          return { ...fromList, ...authUser };
        }
        return authUser;
      }
      // 3) fallback: aucun
      return null;
    } catch {
      return null;
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleSearch() {
    this.isSearchOpen = !this.isSearchOpen;
    if (this.isSearchOpen) {
      // focus après rendu
      setTimeout(() => {
        const input: HTMLInputElement | null =
          this.el.nativeElement.querySelector('#global-search');
        input?.focus();
        input?.select();
      }, 0);
    }
  }

  closeSearch() {
    this.isSearchOpen = false;
  }
handleSearch(ev?: Event) {
  ev?.preventDefault();
  const q = (this.searchQuery || '').trim();
  if (!q) return;
  this.router.navigate(['/search'], { queryParams: { q } });
  this.closeSearch();
}



  // Raccourci clavier "/" pour ouvrir et focus
  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (e.key === '/' && !this.isSearchOpen) {
      e.preventDefault();
      this.toggleSearch();
    }
  }

  private updateCartCount(): void {
    try {
      const raw = localStorage.getItem('cart');
      const items: any[] = raw ? JSON.parse(raw) : [];
      // somme des quantités, comme dans ton React
      this.cartCount = items.reduce((sum, it: any) => sum + (Number(it.quantity) || 1), 0);
    } catch {
      this.cartCount = 0;
    }
  }
}
