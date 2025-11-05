import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AccountLayout} from './account-layout/account-layout'
import { AccountAddresses }from './addresses/addresses'
import {AccountOrders} from './orders/orders'
import {AccountWishlist} from './account-wishlist/account-wishlist'
import { Profile } from './profile/profile';
const routes: Routes = [
  { path: 'accountAddresses', component: AccountAddresses },
  { path: 'accountOrders', component: AccountOrders },
  { path: 'accountWishlist', component: AccountWishlist },
  {path: 'profile', component: Profile}

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountRoutingModule {}
