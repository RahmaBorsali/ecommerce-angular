import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, HostListener, ElementRef } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
  isSearchOpen = false;
  private el = inject(ElementRef);

  private onCartEvents = () => this.updateCartCount();

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateCartCount();
    window.addEventListener('storage', this.onCartEvents);
    window.addEventListener('cartUpdated', this.onCartEvents as EventListener);
  }

  ngOnDestroy(): void {
    window.removeEventListener('storage', this.onCartEvents);
    window.removeEventListener('cartUpdated', this.onCartEvents as EventListener);
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
    this.router.navigate(['/products'], {
      queryParams: q ? { q } : {},
      queryParamsHandling: '',
    });
    // option: garder ouvert pour modifier; sinon refermer:
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
