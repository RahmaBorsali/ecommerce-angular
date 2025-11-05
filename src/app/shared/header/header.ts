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
    this.refreshAuth();
    window.addEventListener('authChanged', this.onAuthChanged);
    window.addEventListener('cartUpdated', this.onCartEvents as EventListener);
  }

  ngOnDestroy(): void {
    window.removeEventListener('authChanged', this.onAuthChanged);
    window.removeEventListener('cartUpdated', this.onCartEvents as EventListener);
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
      const id = localStorage.getItem('authUserId');
      if (id && Array.isArray(users) && users.length) {
        const byId = users.find(u => String(u.id) === String(id));
        if (byId) return byId;
      }
      const authUserRaw = localStorage.getItem('authUser');
      if (authUserRaw) {
        const authUser = JSON.parse(authUserRaw);
        if (Array.isArray(users) && users.length) {
          const fromList = users.find(u => String(u.id) === String(authUser.id));
          return { ...fromList, ...authUser };
        }
        return authUser;
      }
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
    const user = this.auth.currentUser();
    let uid: string;

    // Utilisateur connecté ?
    if (user?.id) {
      uid = String(user.id);
    } else {
      // Invité : utiliser le même mécanisme que CartService
      let gid = sessionStorage.getItem('app.guestId');
      if (!gid) {
        gid = crypto.randomUUID();
        sessionStorage.setItem('app.guestId', gid);
      }
      uid = `guest-${gid}`;
    }

    // Lecture du panier
    const raw = localStorage.getItem(`app.cart.${uid}`);
    const items: any[] = raw ? JSON.parse(raw) : [];

    // Somme des quantités
    this.cartCount = items.reduce(
      (sum, it: any) => sum + (Number(it.quantity) || 1),
      0
    );
  } catch {
    this.cartCount = 0;
  }
}


  private buildAvatarUrl(u: User | null): string | null {
  if (!u) return null;

  // 1) Priorité à l’avatar stocké (profile)
  if ((u as any).avatarUrl && String((u as any).avatarUrl).trim()) {
    return String((u as any).avatarUrl).trim();
  }

  // 2) Fallback: avatar initiales via ui-avatars
  const first = (u as any).firstName ?? '';
  const last  = (u as any).lastName ?? '';
  const name  = encodeURIComponent(`${first || ''} ${last || ''}`.trim() || 'User');
  return `https://ui-avatars.com/api/?name=${name}&background=2563eb&color=fff`;
}

private refreshAuth(): void {
  this.isLoggedIn = this.auth.isLoggedIn();
  this.currentUser = this.auth.currentUser();
  this.avatarUrl = this.buildAvatarUrl(this.currentUser);
}

}
