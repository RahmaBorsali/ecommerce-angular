import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { HeroSlider } from './hero-slider/hero-slider';
import { CategoriesGrid } from './categories-grid/categories-grid';
import { FeaturedProducts } from './featured-products/featured-products';
import { HomeComponent } from './home.component';
import { Header } from "../../shared/header/header";
import { Footer } from "../../shared/footer/footer";

const routes: Routes = [
  { path: '', component: HomeComponent }
];

@NgModule({
  declarations: [ HomeComponent ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    HeroSlider,
    CategoriesGrid,
    FeaturedProducts,
    Header,
    Footer
],
  exports: [HeroSlider, CategoriesGrid, FeaturedProducts
  ]
})
export class HomeModule { }
