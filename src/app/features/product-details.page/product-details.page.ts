import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import { ProductStore, Product } from '../../services/product-store';
import { CartService } from '../../services/cart.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, Header, Footer],
  templateUrl: './product-details.page.html',
})
export class ProductDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private store = inject(ProductStore);
  private cart = inject(CartService);
  images: string[] = [];
  current = 0;

  product?: Product;
  loading = false;
  error: any = null;
  qty = 1;

ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.error = true; return; }

    this.loading = true;
    try {
      const p = this.store.getById(id);
      if (!p) throw new Error('not found');
      this.product = p;

      // S'il y a p.images on les prend, sinon on répète l'image principale
      const imgs = (p as any).images as string[] | undefined;
      this.images = (imgs && imgs.length ? imgs : [p.image, p.image, p.image]).slice(0, 6);
      this.current = 0;

      this.loading = false;
    } catch (e) {
      this.error = e;
      this.loading = false;
    }
  }
  rateRounded(): number { return Math.floor(this.product?.rating ?? 0); }
  rateRaw(): number { return this.product?.rating ?? 0; }

  // 🛒 quantité
  decQty() { this.qty = Math.max(1, this.qty - 1); }
  incQty() { this.qty = Math.min(99, this.qty + 1); }

  addToCart() {
    if (!this.product) return;
    this.cart.addToCart({
      id: this.product.id,
      name: this.product.title,
      price: this.product.price,
      image: this.images[this.current] ?? this.product.image,
      quantity: this.qty,
    });
    Swal.fire({ toast:true, position:'top-end', icon:'success', title:'Ajouté au panier 🛒', timer:1500, showConfirmButton:false });
  }

  // 🎯 galerie
  select(i: number) { this.current = i; }
  isActive(i: number) { return this.current === i; }
}
