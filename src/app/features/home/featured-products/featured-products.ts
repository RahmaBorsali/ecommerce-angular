import { CommonModule } from '@angular/common';
import { Component,inject  } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../services/cart.service';
import Swal from 'sweetalert2';
type Product = {
  id: number;
  title: string;
  price: number;
  rating: number;
  image: string;
};
@Component({
  selector: 'app-featured-products',
  imports: [CommonModule, RouterLink],
  templateUrl: './featured-products.html',
  styleUrl: './featured-products.scss',
})
export class FeaturedProducts {
  private cartSvc = inject(CartService);
  products: Product[] = [
    {
      id: 1,
      title: 'Smartphone Pro X',
      price: 2799,
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
    },
    {
      id: 2,
      title: 'Laptop Ultra 15',
      price: 4999,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600',
    },
    {
      id: 3,
      title: 'Casque Bluetooth Premium',
      price: 459,
      rating: 4.3,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
    },
    {
      id: 4,
      title: 'Console de Jeux Nouvelle Génération',
      price: 2199,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=600',
    },
    {
      id: 5,
      title: 'Écran 4K 27 pouces',
      price: 1249,
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600',
    },
    {
      id: 6,
      title: 'Micro USB Streaming',
      price: 349,
      rating: 4.4,
      image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600',
    },
    {
      id: 7,
      title: 'Lampe LED Smart',
      price: 99,
      rating: 4.2,
      image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600',
    },
    {
      id: 8,
      title: 'Écouteurs True Wireless',
      price: 289,
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600',
    },
  ];

  addToCart(product: Product) {
    this.cartSvc.addToCart({
      id: product.id,
      name: product.title,      // 👈 le CartItems lit "name", pas "title"
      price: product.price,
      image: product.image,
      quantity: 1,        // 👈 important pour le compteur
    });
    Swal.fire({
      title: 'Ajouté au panier 🛒',
      text: `${product.title} a été ajouté avec succès.`,
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#2563eb',
      timer: 5000,
      timerProgressBar: true,
    });
  }

  starArray(rating: number): number[] {
    const full = Math.floor(rating);
    return Array.from({ length: 5 }, (_, i) => (i < full ? 1 : 0));
  }
}
