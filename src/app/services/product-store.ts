import { Injectable } from '@angular/core';

export type Product = {
  id: number;
  title: string;
  price: number;
  rating: number;        // 0..5
  image: string;
  category: string;      // 👈 ajouté
  description?: string;  // optionnel
};

const PRODUCTS: Product[] = [
  {
    id: 1,
    title: 'Smartphone Pro X',
    price: 2799,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
    category: 'Électronique',
    description: 'Smartphone hautes performances avec écran OLED et triple caméra.',
  },
  {
    id: 2,
    title: 'Laptop Ultra 15',
    price: 4999,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600',
    category: 'Informatique',
    description: 'Ultrabook 15" léger, CPU dernière génération et SSD NVMe.',
  },
  {
    id: 3,
    title: 'Casque Bluetooth Premium',
    price: 459,
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
    category: 'Audio',
    description: 'Casque sans fil à réduction de bruit active.',
  },
  {
    id: 4,
    title: 'Console de Jeux Nouvelle Génération',
    price: 2199,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=600',
    category: 'Gaming',
    description: 'Console next-gen avec SSD ultra rapide et Ray Tracing.',
  },
  {
    id: 5,
    title: 'Écran 4K 27 pouces',
    price: 1249,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600',
    category: 'Informatique',
    description: 'Moniteur 27" 4K IPS, 99% sRGB, idéal bureautique/créa.',
  },
  {
    id: 6,
    title: 'Micro USB Streaming',
    price: 349,
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600',
    category: 'Audio',
    description: 'Micro à condensateur pour streaming et podcasts.',
  },
  {
    id: 7,
    title: 'Lampe LED Smart',
    price: 99,
    rating: 4.2,
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600',
    category: 'Maison connectée',
    description: 'Lampe connectée RGB, pilotable via appli.',
  },
  {
    id: 8,
    title: 'Écouteurs True Wireless',
    price: 289,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600',
    category: 'Audio',
    description: 'Écouteurs TWS avec ANC et autonomie 24h.',
  },
];

@Injectable({ providedIn: 'root' })
export class ProductStore {
  getAll(): Product[] {
    return [...PRODUCTS];
  }

  getById(id: number): Product | undefined {
    return PRODUCTS.find(p => p.id === id);
  }

  getCategories(): string[] {
    return Array.from(new Set(PRODUCTS.map(p => p.category)));
  }
}
