// src/app/features/home/categories-grid/categories-grid.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  CategoryService,
  Category,
} from '../../../services/category.service';

@Component({
  selector: 'app-categories-grid',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './categories-grid.html',
  styleUrls: ['./categories-grid.scss'],
})
export class CategoriesGrid implements OnInit {
  private categoryService = inject(CategoryService);

  categories: Category[] = [];

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: (cats) => {
        // tu peux limiter si tu veux, par ex. 10 catégories max :
        this.categories = cats.slice(0, 10);
      },
      error: (err) => {
        console.error('Erreur chargement catégories', err);
        this.categories = [];
      },
    });
  }

  iconClass(icon?: string | null): string {
    // si pas d’icône définie en BDD → icône par défaut
    return icon ? `icon-${icon}` : 'icon-package';
  }
}
