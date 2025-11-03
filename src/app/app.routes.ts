import { Routes } from '@angular/router';
import { CartItems } from './features/cart-items/cart-items';
import { Checkout} from './features/checkout/checkout'
import { CatalogPage } from './features/catalog/catalog.page/catalog.page';
import { ProductDetailPage } from './features/product-details.page/product-details.page' ;
export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadChildren: () =>
      import('./features/home/home-module').then(m => m.HomeModule)
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth-module').then(m => m.AuthModule)
  },
  {
    path: 'cart', component: CartItems
  },
  {
    path: 'checkout', component: Checkout
  },
  {
    path: 'catalog', component: CatalogPage
  },
  {
    path: 'products/:id', component: ProductDetailPage
  }



];
