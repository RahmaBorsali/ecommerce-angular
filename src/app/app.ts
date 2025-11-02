import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeroSlider } from "./features/home/hero-slider/hero-slider";
import { CategoriesGrid } from "./features/home/categories-grid/categories-grid";
import { FeaturedProducts } from "./features/home/featured-products/featured-products";
import { Header } from "./shared/header/header";
import { Footer } from "./shared/footer/footer";
import { Signin } from "./features/auth/signin/signin";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeroSlider, CategoriesGrid, FeaturedProducts, Header, Footer, Signin],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('ecommerce-app');
}
