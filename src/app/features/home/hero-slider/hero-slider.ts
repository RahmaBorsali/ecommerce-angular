import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

type Slide = {
  title: string;
  description: string;
  image: string;
  cta: string;
  link: string;
};
@Component({
  selector: 'app-hero-slider',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './hero-slider.html',
  styleUrl: './hero-slider.scss',
})
export class HeroSlider implements OnInit, OnDestroy {
  slides: Slide[] = [
    {
      title: 'Nouveautés Tech 2025',
      description: 'Découvrez les derniers smartphones et laptops',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1600',
      cta: 'Découvrir',
      link: '/catalog',
    },
    {
      title: 'Gaming Extrême',
      description: 'Équipez-vous pour la victoire',
      image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=1600',
      cta: 'Voir les offres',
      link: '/promotions',
    },
    {
      title: 'Audio Premium',
      description: 'Son exceptionnel à prix imbattable',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600',
      cta: 'Explorer',
      link: '/catalog',
    },
  ];

  current = 0;
  private timerId?: number;

  ngOnInit(): void {
    this.timerId = window.setInterval(() => {
      this.current = (this.current + 1) % this.slides.length;
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  goTo(i: number) {
    this.current = i;
  }

  isActive(i: number): boolean {
    return this.current === i;
  }
  getQueryParams(s: Slide) {
    if (s.title.includes('Tech')) {
      return { category: 'electronique' };
    }
    if (s.title.includes('Gaming')) {
      return {};
    }
    if (s.title.includes('Audio')) {
      return { category: 'audio' };
    }
    return {};
  }
}
