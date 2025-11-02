import { Routes } from '@angular/router';
import { CartItems } from './features/cart-items/cart-items';

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
  }


];
