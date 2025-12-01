import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer implements OnInit, OnDestroy {
  year = new Date().getFullYear();

  isLoggedIn = false;
  currentUser: User | null = null;

  private auth = inject(AuthService);

  constructor(private router: Router) {}

  // 🔔 listener pour les changements d’auth
  private onAuthChanged = () => this.refreshAuth();

  ngOnInit(): void {
    this.refreshAuth();
    window.addEventListener('authChanged', this.onAuthChanged);
  }

  ngOnDestroy(): void {
    window.removeEventListener('authChanged', this.onAuthChanged);
  }

  goToAccount(): void {
    this.refreshAuth();
    this.router.navigate([this.isLoggedIn ? '/account/profile' : '/auth/signin']);
  }

  private refreshAuth(): void {
    this.currentUser = this.auth.currentUser();
    this.isLoggedIn = !!this.currentUser;
  }
}
