import { Routes, RouterModule } from '@angular/router';
import { CartItems } from './features/cart-items/cart-items';
import { Checkout } from './features/checkout/checkout';
import { CatalogPage } from './features/catalog/catalog.page/catalog.page';
import { ProductDetailPage } from './features/product-details.page/product-details.page';
import { Profile } from './features/account/profile/profile';
import { authGuard } from './guards/auth.guard';
import { SearchResults } from './features/search-results/search-results';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadChildren: () => import('./features/home/home-module').then((m) => m.HomeModule),
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth-module').then((m) => m.AuthModule),
  },
  {
    path: 'cart',
    component: CartItems,
  },
  {
    path: 'checkout',
    component: Checkout,
  },
  {
    path: 'catalog',
    component: CatalogPage,
  },
  {
    path: 'products/:id',
    component: ProductDetailPage,
  },

  {
    path: 'account',
    canActivate: [authGuard], // protège toutes les sous-pages
    loadComponent: () =>
      import('./features/account/account-layout/account-layout').then((m) => m.AccountLayout),

    children: [
      { path: '', pathMatch: 'full', redirectTo: 'profile' },
      {
        path: 'profile',
        loadComponent: () => import('./features/account/profile/profile').then((m) => m.Profile),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/account/orders/orders').then((m) => m.AccountOrders),
      },
      {
        path: 'wishlist',
        loadComponent: () =>
          import('./features/account/account-wishlist/account-wishlist').then(
            (m) => m.AccountWishlist
          ),
      },
      {
        path: 'addresses',
        loadComponent: () =>
          import('./features/account/addresses/addresses').then((m) => m.AccountAddresses),
      },
    ],
  },
  { path: 'search', component: SearchResults },
  {
    path: 'order/success',
    loadComponent: () =>
      import('./features/order-success/order-success').then((m) => m.OrderSuccess),
  },
  {
    path: 'promotions',
    loadComponent: () =>
      import('./features/promotions/promotions.page').then((m) => m.PromotionsPage),
  },
];
