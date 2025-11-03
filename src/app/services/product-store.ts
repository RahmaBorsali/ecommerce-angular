import { Injectable } from '@angular/core';

export type Product = {
  id: number;
  title: string;
  price: number;
  rating: number; // 0..5
  image: string;
  category: string; // 👈 ajouté
  description?: string; // optionnel
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
    category: 'Maison',
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
  {
    id: 9,
    title: 'Appareil Photo Mirrorless',
    price: 1499,
    category: 'Photo',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400',
    description: 'Qualité professionnelle pour photographes',
  },
  {
    id: 10,
    title: 'Enceinte Intelligente',
    price: 129,
    category: 'Audio',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
    rating: 4.2,
    description: 'Assistant vocal et son premium',
  },
  {
    id: 11,
    title: 'Clavier Mécanique RGB',
    price: 159,
    category: 'Accessoires',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
    rating: 4.5,
    description: 'Précision et confort pour gamers',
  },
  {
    id: 12,
    title: 'Souris Gaming Pro',
    price: 79,
    category: 'Accessoires',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
    rating: 4.4,
    description: 'Capteur haute précision 16000 DPI',
  },
  {
    id: 13,
    title: 'Écran 4K 27 pouces',
    price: 449,
    category: 'Électronique',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
    rating: 4.6,
    description: 'Dalle IPS avec HDR pour professionnels',
  },
  {
    id: 14,
    title: 'Webcam HD Pro',
    price: 89,
    category: 'Accessoires',
    image: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=400',
    rating: 4.3,
    description: 'Qualité vidéo 1080p pour visioconférences',
  },
  {
    id: 15,
    title: 'Chargeur Sans Fil Rapide',
    price: 39,
    category: 'Accessoires',
    image: 'https://images.unsplash.com/photo-1591290619762-d2c1f9a34d7d?w=400',
    rating: 4.1,
    description: 'Charge rapide 15W compatible tous appareils',
  },
  {
    id: 16,
    title: 'Sac à Dos Tech',
    price: 69,
    category: 'Accessoires',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    rating: 4.4,
    description: 'Protection optimale pour ordinateur portable',
  },
  {
    id: 17,
    title: 'Drone 4K',
    price: 799,
    category: 'Photo',
    image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400',
    rating: 4.5,
    description: 'Stabilisation avancée et autonomie 30min',
  },
  {
    id: 18,
    title: 'Hub USB-C 7 Ports',
    price: 59,
    category: 'Accessoires',
    image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400',
    rating: 4.3,
    description: 'Extension complète pour laptop',
  },
  {
    id: 19,
    title: 'Manette Pro Controller',
    price: 69,
    category: 'Gaming',
    image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400',
    rating: 4.6,
    description: 'Ergonomie premium pour gaming intensif',
  },
  {
    id: 20,
    title: 'Câble HDMI 2.1',
    price: 29,
    category: 'Accessoires',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    rating: 4.4,
    description: 'Support 8K 60Hz et HDR',
  },
  {
    id: 21,
    title: 'Station de Charge Multi',
    price: 79,
    category: 'Accessoires',
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400',
    rating: 4.2,
    description: 'Charge simultanée de 4 appareils',
  },
  {
    id: 22,
    title: 'Projecteur Portable',
    price: 399,
    category: 'Électronique',
    image: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400',
    rating: 4.5,
    description: "Projection Full HD jusqu'à 120 pouces",
  },
  {
    id: 23,
    title: 'Caméra de Sécurité WiFi',
    price: 89,
    category: 'Maison',
    image: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=400',
    rating: 4.3,
    description: 'Vision nocturne et détection mouvement',
  },
  {
    id: 24,
    title: 'Barre de Son 2.1',
    price: 249,
    category: 'Audio',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400',
    rating: 4.6,
    description: 'Son surround virtuel avec caisson',
  },
  {
    id: 25,
    title: 'Support PC Gamer RGB',
    price: 39,
    category: 'Accessoires',
    image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400',
    rating: 4.1,
    description: 'Éclairage RGB personnalisable',
  },
  {
    id: 26,
    title: 'Adaptateur USB-C vers HDMI',
    price: 25,
    category: 'Accessoires',
    image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400',
    rating: 4.4,
    description: 'Support 4K 60Hz',
  },
  {
    id: 27,
    title: 'Tapis de Souris XXL',
    price: 35,
    category: 'Accessoires',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
    rating: 4.3,
    description: 'Surface ultra-lisse 900x400mm',
  },
];

@Injectable({ providedIn: 'root' })
export class ProductStore {
  getAll(): Product[] {
    return [...PRODUCTS];
  }

  getById(id: number): Product | undefined {
    return PRODUCTS.find((p) => p.id === id);
  }

  getCategories(): string[] {
    return Array.from(new Set(PRODUCTS.map((p) => p.category)));
  }
}
