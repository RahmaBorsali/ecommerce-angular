import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../services/auth.service';
import { Component, OnDestroy, OnInit, inject, HostListener, ElementRef } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  year = new Date().getFullYear();
   isLoggedIn = false;
     currentUser: User | null = null;
       constructor(private router: Router) {}
  private auth = inject(AuthService);

  goToAccount(): void {
    this.refreshAuth();
    this.router.navigate([ this.isLoggedIn ? '/account/profile' : '/auth/signin' ]);
  }
  private refreshAuth(): void {
  this.isLoggedIn = this.auth.isLoggedIn();
  this.currentUser = this.auth.currentUser();
}
}
