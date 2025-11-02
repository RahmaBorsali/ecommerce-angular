import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  template: `
  <app-header></app-header>
    <app-hero-slider></app-hero-slider>
    <app-categories-grid></app-categories-grid>
    <app-featured-products></app-featured-products>
    <app-footer></app-footer>
  ` ,
  standalone : false
})
export class HomeComponent {}
