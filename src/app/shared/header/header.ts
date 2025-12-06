import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, HostListener, ElementRef ,ChangeDetectorRef} from '@angular/core';
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
  private auth = inject(AuthService);

  currentUser: User | null = null;

  constructor(private router: Router, private cdr: ChangeDetectorRef ) {}

   private onAuthChanged = () => {
    this.refreshAuth();
    this.cdr.detectChanges();
  };

  private onCartEvents = () => {
    this.updateCartCount();
    this.cdr.detectChanges();   
  };

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
    this.refreshAuth(); // on s’assure d’avoir l’état à jour
    this.router.navigate([this.isLoggedIn ? '/account/profile' : '/auth/signin']);
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleSearch() {
    this.isSearchOpen = !this.isSearchOpen;
    if (this.isSearchOpen) {
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

      if (user?.id) {
        // user connecté
        uid = String(user.id);
      } else {
        // invité
        let gid = sessionStorage.getItem('app.guestId');
        if (!gid) {
          gid = crypto.randomUUID();
          sessionStorage.setItem('app.guestId', gid);
        }
        uid = `guest-${gid}`;
      }

      const raw = localStorage.getItem(`app.cart.${uid}`);
      const items: any[] = raw ? JSON.parse(raw) : [];
      this.cartCount = items.reduce((sum, it: any) => sum + (Number(it.quantity) || 1), 0);
    } catch {
      this.cartCount = 0;
    }
  }

  private buildAvatarUrl(u: User | null): string | null {
    if (!u) return null;

    if ((u as any).avatarUrl && String((u as any).avatarUrl).trim()) {
      return String((u as any).avatarUrl).trim();
    }

    const first = (u as any).firstName ?? '';
    const last = (u as any).lastName ?? '';
    const name = encodeURIComponent(`${first || ''} ${last || ''}`.trim() || 'User');
    return `https://ui-avatars.com/api/?name=${name}&background=2563eb&color=fff`;
  }

  private refreshAuth(): void {
    this.currentUser = this.auth.currentUser();
    this.isLoggedIn = !!this.currentUser;
    this.avatarUrl = this.buildAvatarUrl(this.currentUser);
  }
}
