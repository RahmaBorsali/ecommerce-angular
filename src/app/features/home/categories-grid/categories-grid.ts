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
  ];

    iconClass(name: string) { return `icon-${name}`; }


}
