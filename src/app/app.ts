import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeroSlider } from "./features/home/hero-slider/hero-slider";
import { CategoriesGrid } from "./features/home/categories-grid/categories-grid";
import { FeaturedProducts } from "./features/home/featured-products/featured-products";
import { Navbar } from "./shared/navbar/navbar";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeroSlider, CategoriesGrid, FeaturedProducts, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('ecommerce-app');
}
