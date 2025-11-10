import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, of, switchMap, Observable,throwError  } from 'rxjs';
/** Types additionnels */
export type Spec = { label: string; value: string };
export type Review = { author: string; rating: number; date: string; comment: string };

/** Modèle produit enrichi */
export type Product = {
  id: number;
  title: string;
  price: number;
  oldPrice?: number;
  discountPercent?: number;
  rating: number;
  image: string;
  category: string;
  description?: string;
  stock?: number;
  specs?: Spec[];
  reviews?: Review[];
  images?: string[];

};

const PRODUCTS_RAW: Product[] = [
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
    image: '../../assets/hdpro.jpg',
    rating: 4.3,
    description: 'Qualité vidéo 1080p pour visioconférences',
  },
  {
    id: 15,
    title: 'Chargeur Sans Fil Rapide',
    price: 39,
    category: 'Accessoires',
    image: '../../assets/chargeursansfil.jpg',
    rating: 4.1,
    description: 'Charge rapide 15W compatible tous appareils',
  },
  {
    id: 16,
    title: 'Sac à Dos Tech',
    price: 69,
    category: 'Accessoires',
    image: '../../assets/sac.jpg',
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
    image: '../../assets/hub.avif',
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
    image: '../../assets/cable.jpg',
    rating: 4.4,
    description: 'Support 8K 60Hz et HDR',
  },
  {
    id: 21,
    title: 'Station de Charge Multi',
    price: 79,
    category: 'Accessoires',
    image: '../../assets/stationcharge.jpg',
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
    image: '../../assets/camera.jpg',
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
  {
    id: 28,
    title: 'Crème Hydratante Naturelle',
    price: 59,
    category: 'beaute',
    image: '../../assets/creme.jpg',
    rating: 4.7,
    description: 'Crème visage hydratante à base d’aloé vera et huiles naturelles.',
  },
  {
    id: 29,
    title: 'Shampooing Bio Revitalisant',
    price: 39,
    category: 'beaute',
    image: '../../assets/shompoing.jpg',
    rating: 4.5,
    description: 'Shampooing sans sulfate pour cheveux doux et brillants.',
  },
  {
    id: 30,
    title: 'Aspirateur Sans Fil Cyclone X200',
    price: 299,
    category: 'Maison',
    image: '../../assets/aspirateur.jpg',
    rating: 4.6,
    description: 'Aspirateur sans fil puissant avec batterie longue durée et filtre HEPA.',
  },
  {
    id: 31,
    title: 'Robot de Cuisine Multifonction',
    price: 499,
    category: 'Maison',
    image: '../../assets/robot.jpg',
    rating: 4.8,
    description:
      'Robot de cuisine intelligent avec balance intégrée et 12 programmes automatiques.',
  },
];

const DEFAULT_STOCK_BY_CAT: Record<string, number> = {
  Électronique: 12,
  Informatique: 8,
  Audio: 20,
  Gaming: 15,
  Photo: 6,
  Accessoires: 40,
  Maison: 18,
  beaute: 30,
};

const DEFAULT_SPECS_BY_CAT: Record<string, Spec[]> = {
  Électronique: [
    { label: 'Tension', value: '220–240 V' },
    { label: 'Connectivité', value: 'Wi-Fi / Bluetooth' },
    { label: 'Garantie', value: '24 mois' },
  ],
  Informatique: [
    { label: 'CPU', value: 'Quad/Octa-core' },
    { label: 'RAM', value: '8–32 Go' },
    { label: 'Stockage', value: '256 Go – 1 To SSD' },
  ],
  Audio: [
    { label: 'Réponse en fréquence', value: '20 Hz – 20 kHz' },
    { label: 'Bluetooth', value: '5.x' },
    { label: 'Autonomie', value: 'Jusqu’à 24 h' },
  ],
  Gaming: [
    { label: 'Stockage', value: '1 To NVMe' },
    { label: 'Sortie vidéo', value: 'HDMI 2.1' },
    { label: 'Réseau', value: 'Wi-Fi 6 / LAN' },
  ],
  Photo: [
    { label: 'Capteur', value: 'APS-C / Full-Frame' },
    { label: 'Résolution', value: '24–45 MP' },
    { label: 'Monture', value: 'Compat. objectifs interchangeables' },
  ],
  Accessoires: [
    { label: 'Compatibilité', value: 'Windows / macOS / Android / iOS' },
    { label: 'Matériau', value: 'ABS / Aluminium' },
  ],
  Maison: [
    { label: 'Puissance', value: '800–2000 W' },
    { label: 'Niveau sonore', value: '≤ 72 dB' },
    { label: 'Filtration', value: 'HEPA / lavable' },
  ],
  beaute: [
    { label: 'Type de peau', value: 'Tous types' },
    { label: 'Sans', value: 'Paraben / Sulfates' },
    { label: 'Origine', value: 'Ingrédients naturels' },
  ],
};

const DEFAULT_REVIEWS: Review[] = [
  {
    author: 'Nadia',
    rating: 5,
    date: '2025-10-12',
    comment: 'Qualité au top, conforme à la description.',
  },
  { author: 'Yassine', rating: 4, date: '2025-09-28', comment: 'Très bon rapport qualité/prix.' },
];

function withDefaults(p: Product): Product {
  const stock = p.stock ?? DEFAULT_STOCK_BY_CAT[p.category] ?? 10;
  const specs = p.specs && p.specs.length ? p.specs : DEFAULT_SPECS_BY_CAT[p.category] ?? [];
  const reviews = p.reviews && p.reviews.length ? p.reviews : DEFAULT_REVIEWS;
  const images = p.images && p.images.length ? p.images : [p.image];

  return { ...p, stock, specs, reviews, images };
}

/** Personnalise finement quelques produits (exemples concrets) */
function applyCustomizations(p: Product): Product {
  switch (p.id) {
    case 1: // Smartphone Pro X
      return {
        ...p,
        stock: 14,
        specs: [
          { label: 'Écran', value: '6.5" OLED 120 Hz' },
          { label: 'SoC', value: 'Snapdragon 8 Gen 2' },
          { label: 'RAM', value: '12 Go' },
          { label: 'Stockage', value: '256 Go' },
          { label: 'Batterie', value: '5000 mAh' },
        ],
        reviews: [
          {
            author: 'Meriem',
            rating: 5,
            date: '2025-10-20',
            comment: 'Ultra fluide et photos magnifiques.',
          },
          {
            author: 'Adel',
            rating: 4,
            date: '2025-10-05',
            comment: 'Autonomie correcte, charge très rapide.',
          },
        ],
        images: [p.image, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600'],
      };
    case 2: // Laptop Ultra 15
      return {
        ...p,
        stock: 9,
        specs: [
          { label: 'Écran', value: '15.6" 4K UHD' },
          { label: 'CPU', value: 'Intel Core i7 13ᵉ gen' },
          { label: 'RAM', value: '16 Go' },
          { label: 'Stockage', value: '1 To SSD NVMe' },
          { label: 'Poids', value: '1.4 kg' },
        ],
        reviews: [
          {
            author: 'Hana',
            rating: 5,
            date: '2025-09-22',
            comment: 'Parfait pour le montage vidéo.',
          },
          {
            author: 'Sami',
            rating: 4,
            date: '2025-09-11',
            comment: 'Écran sublime, ventilateurs audibles en charge.',
          },
        ],
      };
    case 3: // Casque BT
      return {
        ...p,
        stock: 22,
        specs: [
          { label: 'ANC', value: 'Active' },
          { label: 'Bluetooth', value: '5.3' },
          { label: 'Autonomie', value: '30 h' },
        ],
      };
    case 4: // Console
      return {
        ...p,
        stock: 11,
        specs: [
          { label: 'SSD', value: '1 To' },
          { label: 'Ray Tracing', value: 'Oui' },
          { label: 'Sortie', value: 'HDMI 2.1' },
        ],
      };
    case 30: // Aspirateur
      return {
        ...p,
        stock: 13,
        specs: [
          { label: 'Puissance', value: '120 AW' },
          { label: 'Autonomie', value: '45 min' },
          { label: 'Filtre', value: 'HEPA' },
        ],
      };
    case 31: // Robot cuisine
      return {
        ...p,
        stock: 6,
        specs: [
          { label: 'Capacité bol', value: '4.5 L' },
          { label: 'Programmes', value: '12' },
          { label: 'Balance', value: 'Intégrée' },
        ],
      };
    default:
      return p;
  }
}

const PRODUCTS: Product[] = PRODUCTS_RAW.map((p) => withDefaults(applyCustomizations(p)));

@Injectable({ providedIn: 'root' })
export class ProductStore {
  private http = inject(HttpClient);
  private baseUrl = 'https://fakestoreapi.com';

  private fetchApiProduct$(apiId: number): Observable<Product> {
    return this.http.get<any>(`${this.baseUrl}/products/${apiId}`).pipe(
      map((api) => ({
        id: 1000 + api.id, // on garde le namespace en interne si tu veux
        title: api.title,
        price: api.price,
        rating: api.rating?.rate ?? 0,
        image: api.image,
        category: api.category,
        description: api.description,
        stock: 10,
        specs: [
          { label: 'Origine', value: 'Importé' },
          { label: 'Matériau', value: 'Standard' },
        ],
        reviews: [
          {
            author: 'Client API',
            rating: 4,
            date: '2025-10-01',
            comment: 'Bon rapport qualité/prix.',
          },
        ],
        images: [api.image, api.image, api.image],
      }))
    );
  }

  /** Ancienne signature (si tu l'utilises ailleurs) */
  getOne$(id: number): Observable<Product> {
    if (id >= 1000) return this.fetchApiProduct$(id - 1000);

    const local = PRODUCTS.find((p) => p.id === id);
    if (local) return of(local);

    if (id >= 1 && id <= 20) return this.fetchApiProduct$(id); // fallback
    return throwError(() => new Error('not-found'));
  }

  /** ✅ Nouvelle méthode: accepte un slug "fs-5" OU un id "12" */
  getOneByKey$(key: string): Observable<Product> {
    const m = /^fs-(\d+)$/.exec(key); // ex: fs-5 = FakeStore id 5
    if (m) return this.fetchApiProduct$(Number(m[1]));

    if (/^\d+$/.test(key)) {
      return this.getOne$(Number(key)); // local id
    }

    return throwError(() => new Error('not-found'));
  }

  /** Fusion: ajoute un slug pour chaque produit */
  getAllMerged$(): Observable<Product[]> {
    return this.http.get<any[]>(`${this.baseUrl}/products`).pipe(
      map((apiList) =>
        apiList.map(
          (api) =>
            ({
              id: 1000 + api.id,
              title: api.title,
              price: api.price,
              rating: api.rating?.rate ?? 0,
              image: api.image,
              category: api.category,
              description: api.description,
              stock: 10,
              images: [api.image],
              // 🔑 utile pour routerLink côté grille
              // @ts-ignore: on tolère un champ d'affichage
              slug: `fs-${api.id}`,
            } as Product & { slug: string })
        )
      ),
      map((apiProducts) => {
        const localsWithSlug = PRODUCTS.map(
          (p) => ({ ...p, slug: String(p.id) } as Product & { slug: string })
        );
        return [...localsWithSlug, ...apiProducts];
      })
    );
  }

  /** 🔹 Catégories fusionnées */
  getCategories$() {
    return this.getAllMerged$().pipe(map((all) => Array.from(new Set(all.map((p) => p.category)))));
  }

  getAll(): Product[] {
    // clone pour éviter mutations externes
    return PRODUCTS.map((p) => ({
      ...p,
      specs: [...(p.specs ?? [])],
      reviews: [...(p.reviews ?? [])],
      images: [...(p.images ?? [])],
    }));
  }

  getById(id: number): Product | undefined {
    const p = PRODUCTS.find((x) => x.id === id);
    return p
      ? {
          ...p,
          specs: [...(p.specs ?? [])],
          reviews: [...(p.reviews ?? [])],
          images: [...(p.images ?? [])],
        }
      : undefined;
  }

  getCategories(): string[] {
    return Array.from(new Set(PRODUCTS.map((p) => p.category)));
  }
}
