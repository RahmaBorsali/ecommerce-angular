// src/app/features/catalog/catalog.page.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { ProductStore, Product } from '../../../services/product-store';
import { ProductGrid } from '../product-grid/product-grid';

// ---- Slugs supportés par ton site
const SITE_SLUGS = new Set<string>([
  'electronique',
  "men's clothing",
  "women's clothing",
  'jewelery',
]);

// ---- Normalisation des catégories d'URL (mens/womens sans apostrophe, etc.)
const CATEGORY_ALIASES: Record<string, string> = {
  'womens clothing': "women's clothing",
  'women%27s clothing': "women's clothing",
  'mens clothing': "men's clothing",
  'men%27s clothing': "men's clothing",
  electronics: 'electronique',
  jewelry: 'jewelery',
};
function normalizeCategory(raw: string | null): string {
  if (!raw) return '';
  const key = raw.trim().toLowerCase();
  return CATEGORY_ALIASES[key] ?? raw;
}

// ---- Mapping FakeStore -> slugs de ton site
const FS_TO_SITE: Record<string, string> = {
  electronics: 'electronique',
  jewelery: 'jewelery',
  "men's clothing": "men's clothing",
  "women's clothing": "women's clothing",
};

// ---- Adaptateur FakeStore -> Product
type FakeStoreItem = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: 'electronics' | 'jewelery' | "men's clothing" | "women's clothing";
  image: string;
  rating?: { rate: number; count: number };
};
function adaptFs(p: FakeStoreItem): Product {
  const siteCat = FS_TO_SITE[p.category] ?? p.category;
  return {
    id: `fs-${p.id}` as any,
    title: p.title,
    description: p.description,
    price: p.price,
    image: p.image,
    category: slugify(siteCat), // 👈 normalise
    rating: p.rating?.rate ?? 0,
  };
}

// ---- Catégories réellement présentes dans une liste de produits
function categoriesFromProducts(products: Product[]): string[] {
  const set = new Set<string>();
  for (const p of products) {
    if (p?.category && SITE_SLUGS.has(p.category)) set.add(p.category);
  }
  return Array.from(set);
}
// Remplace accents, met en minuscule, normalise quelques alias FR/EN
function slugify(raw: string): string {
  if (!raw) return '';
  const base = raw
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '') // enlève accents
    .toLowerCase()
    .trim();

  // alias FR -> slugs
  const aliases: Record<string, string> = {
    'vetements femme': "women's clothing",
    'vetement femme': "women's clothing",
    femme: "women's clothing",
    'vetements homme': "men's clothing",
    'vetement homme': "men's clothing",
    homme: "men's clothing",
    bijoux: 'jewelery',
    electronique: 'electronique',
    electronics: 'electronique',
    jewelry: 'jewelery',
    "women's clothing": "women's clothing",
    "men's clothing": "men's clothing",
    jewelery: 'jewelery',
  };

  // si c'est déjà un slug attendu, on renvoie direct
  if (aliases[base]) return aliases[base];

  return base; // ex: si local a "jeweLery", ça deviendra "jewelery" via SELECT ci-dessous
}

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink, Header, Footer, ProductGrid],
  templateUrl: './catalog.page.html',
})
export class CatalogPage implements OnInit {
  // toutes les catégories du site (slugs)
  ALL_SITE_CATEGORIES: string[] = [
    'electronique',
    'audio',
    'gaming',
    'photo',
    'accessoires',
    "men's clothing",
    "women's clothing",
    'jewelery',
    'maison',
    'beaute',
  ];

  private store = inject(ProductStore);
  private route = inject(ActivatedRoute);

  products: Product[] = [];
  categories: string[] = [];
  selectedCategory = '';
  loading = false;
  error: any = null;

  async ngOnInit(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      // 1) Produits locaux
      const localProducts = this.store.getAll();

      // 2) FakeStore via fetch
      const resp = await fetch('https://fakestoreapi.com/products');
      if (!resp.ok) throw new Error('FakeStore fetch failed');
      const fsItems = (await resp.json()) as FakeStoreItem[];
      const fsAdapted = fsItems.map(adaptFs);

      // 3) Fusion
      const merged = [...localProducts, ...fsAdapted];

      for (const p of merged) {
        p.category = slugify(p.category);
      }
      this.categories = this.ALL_SITE_CATEGORIES;

      this.products = merged;


      // Debug utile
      console.table([
        { where: 'local', count: localProducts.length },
        { where: 'fakestore', count: fsAdapted.length },
        { where: 'merged', count: merged.length },
      ]);
      console.log('catsFromProducts:', this.categories);
    } catch (e) {
      this.error = e;
      // fallback local
      const local = this.store.getAll();
      this.products = local;
      this.categories = categoriesFromProducts(local);
      console.error(e);
    } finally {
      this.loading = false;
    }

    // Normaliser la catégorie prise depuis l’URL
    this.route.queryParamMap.subscribe((p) => {
      this.selectedCategory = normalizeCategory(p.get('category'));
    });
    window.scrollTo(0, 0);

  }


  reload() {
    this.ngOnInit();
  }
}
