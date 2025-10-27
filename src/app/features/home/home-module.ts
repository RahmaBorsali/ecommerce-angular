import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { HeroSlider } from './hero-slider/hero-slider';
import { CategoriesGrid } from './categories-grid/categories-grid';
import { FeaturedProducts } from './featured-products/featured-products';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule,
    HeroSlider,
    CategoriesGrid,
    FeaturedProducts
  ],
  exports: [HeroSlider, CategoriesGrid, FeaturedProducts
  ]
})
export class HomeModule { }
