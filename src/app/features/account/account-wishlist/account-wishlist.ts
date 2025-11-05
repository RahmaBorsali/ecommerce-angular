import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { WishlistService, WishItem } from '../../../services/wishlist.service';

@Component({
  standalone: true,
  selector: 'app-account-wishlist',
  imports: [CommonModule, RouterLink],
  templateUrl: './account-wishlist.html'
})
export class AccountWishlist implements OnInit {
  items = signal<WishItem[]>([]);

  constructor(private wl: WishlistService) {}

  ngOnInit(): void {
    this.reload();
    window.addEventListener('wishlistUpdated', this.reload as EventListener);
  }
  ngOnDestroy(): void {
    window.removeEventListener('wishlistUpdated', this.reload as EventListener);
  }
  private reload = () => this.items.set(this.wl.list());

  async remove(it: WishItem) {
    const res = await Swal.fire({
      icon: 'warning',
      title: 'Retirer ce favori ?',
      text: it.title,
      showCancelButton: true,
      confirmButtonText: 'Oui, retirer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#dc2626', // rouge
    });
    if (res.isConfirmed) {
      this.wl.remove(it.id);
      this.reload();
      Swal.fire({ toast: true, position: 'top-end', timer: 1200, showConfirmButton: false, icon: 'success', title: 'Retiré des favoris' });
    }
  }

  async clearAll() {
    const res = await Swal.fire({
      icon: 'warning',
      title: 'Tout effacer ?',
      text: 'Tous vos favoris seront supprimés.',
      showCancelButton: true,
      confirmButtonText: 'Oui, tout effacer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#dc2626', // rouge
    });
    if (res.isConfirmed) {
      this.wl.clearAll();
      this.reload();
      Swal.fire({ toast: true, position: 'top-end', timer: 1200, showConfirmButton: false, icon: 'success', title: 'Favoris vidés' });
    }
  }
}
