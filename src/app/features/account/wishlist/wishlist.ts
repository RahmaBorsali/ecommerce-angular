import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
type Wish = { id:number|string; title:string; price:number; image?:string };

const LS_WISHLIST = 'app.wishlist';
const LS_CART = 'cart';

@Component({
  standalone: true,
  selector: 'app-account-wishlist',
  imports: [CommonModule,RouterLink],
  templateUrl: './wishlist.html'
})
export class AccountWishlist implements OnInit {
  wishes = signal<Wish[]>([]);

  ngOnInit(): void {
    this.wishes.set(JSON.parse(localStorage.getItem(LS_WISHLIST) || '[]'));
  }

  remove(w: Wish) {
    const next = this.wishes().filter(x => x.id !== w.id);
    this.wishes.set(next);
    localStorage.setItem(LS_WISHLIST, JSON.stringify(next));
  }

  addToCart(w: Wish) {
    const cart = JSON.parse(localStorage.getItem(LS_CART) || '[]');
    const idx = cart.findIndex((c:any) => c.id === w.id);
    if (idx>=0) cart[idx].quantity = (cart[idx].quantity||1) + 1;
    else cart.push({ id:w.id, title:w.title, price:w.price, image:w.image, quantity:1 });
    localStorage.setItem(LS_CART, JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  }
}
