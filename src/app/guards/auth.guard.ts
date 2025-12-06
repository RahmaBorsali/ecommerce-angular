import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * AuthGuard
 * Empêche l'accès aux routes protégées si l'utilisateur n'est pas connecté.
 */
export const authGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Si session valide -> accès autorisé
  if (auth.isLoggedIn()) {
    return true;
  }

  // Sinon -> redirection vers /auth/signin
  return router.createUrlTree(['/auth/signin'], {
    queryParams: { returnUrl: state.url },
  });
};
