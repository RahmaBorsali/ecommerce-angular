// src/app/features/account/account-wishlist/account-wishlist.ts
import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { WishlistService, WishItem } from '../../../services/wishlist.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-account-wishlist',
  imports: [CommonModule, RouterLink],
  templateUrl: './account-wishlist.html',
})
export class AccountWishlist implements OnInit, OnDestroy {
  items = signal<WishItem[]>([]);

  private wl = inject(WishlistService);
  private auth = inject(AuthService);

  // flèche = this toujours lié
  private reload = () => this.items.set(this.wl.list());

  ngOnInit(): void {
    const user = this.auth.currentUser();

    // 🔁 si connecté → on charge depuis la BD et on sync le localStorage
    if (user?.id) {
      this.wl.syncFromServer();
    }

    // puis on lit le local (qui vient d’être sync)
    this.reload();

    // écoute les mises à jour (toggle depuis fiche produit, etc.)
    window.addEventListener('wishlistUpdated', this.reload as EventListener);
  }

  ngOnDestroy(): void {
    window.removeEventListener('wishlistUpdated', this.reload as EventListener);
  }

  async remove(it: WishItem) {
    const res = await Swal.fire({
      icon: 'warning',
      title: 'Retirer ce favori ?',
      text: it.title,
      showCancelButton: true,
      confirmButtonText: 'Oui, retirer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#dc2626',
    });

    if (res.isConfirmed) {
      await this.wl.remove(it.id); // 🔁 enlève local + BD si connecté
      this.reload();
      Swal.fire({
        toast: true,
        position: 'top-end',
        timer: 1200,
        showConfirmButton: false,
        icon: 'success',
        title: 'Retiré des favoris',
      });
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
      confirmButtonColor: '#dc2626',
    });

    if (res.isConfirmed) {
      this.wl.clearAll(); // 🟦 vide front + backend
      this.reload();
      Swal.fire({
        toast: true,
        position: 'top-end',
        timer: 1200,
        showConfirmButton: false,
        icon: 'success',
        title: 'Favoris vidés',
      });
    }
  }
}
