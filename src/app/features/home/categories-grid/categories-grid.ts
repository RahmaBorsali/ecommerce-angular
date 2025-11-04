import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

type Category = { id?: number; name: string; slug: string; image: string; icon: string };


@Component({
  selector: 'app-categories-grid',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './categories-grid.html',
  styleUrls: ['./categories-grid.scss'],
})
export class CategoriesGrid {
  categories: Category[] = [
    { name: 'Électronique', slug: 'electronique', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600', icon: 'cpu' },
    { name: 'Audio',        slug: 'audio',        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', icon: 'headphones' },
    { name: 'Gaming',       slug: 'gaming',       image: 'https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=600', icon: 'gamepad-2' },
    { name: 'Photo',        slug: 'photo',        image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600', icon: 'camera' },
    { name: 'Accessoires',  slug: 'accessoires',  image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600', icon: 'package' },
    {
      name: 'Vêtements Homme',
      slug: "men's clothing",
      image: 'https://images.unsplash.com/photo-1521334884684-d80222895322?w=800',
      icon: 'shirt',
    },
    {
      name: 'Vêtements Femme',
      slug: "women's clothing",
      image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800',
      icon: 'shopping-bag',
    },
    {
      name: 'Bijoux',
      slug: 'jewelery',
      image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800',
      icon: 'gem',
    },
    {
      name: 'Maison',
      slug: 'maison',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      icon: 'home',
    },
    {
      name: 'Beauté & Soins',
      slug: 'beaute',
      image: 'https://images.unsplash.com/photo-1600180758890-6a3b4b3a5a2f?w=800',
      icon: 'sparkles',
    },
  ];

    iconClass(name: string) { return `icon-${name}`; }
  


}
