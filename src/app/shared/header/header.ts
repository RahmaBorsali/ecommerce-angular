import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit, OnDestroy{
  logoUrl = 'assets/logo.png';
  searchQuery = '';
  cartCount = 0;
  isMenuOpen = false;
  isSearchOpen = false;

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

  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
  }

  handleSearch(event: Event): void {
    event.preventDefault();
    const q = this.searchQuery.trim();
    if (!q) return;
    // équivalent à catalog.html?search=...
    this.router.navigate(['/products'], { queryParams: { search: q } });
    this.isSearchOpen = false;
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
