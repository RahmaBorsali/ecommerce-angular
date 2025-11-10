import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 *  AuthGuard
 * Empêche l'accès aux routes protégées si l'utilisateur n'est pas connecté.
 * Vérifie la session dans localStorage (via AuthService.isLoggedIn()).
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  //  Si session valide -> accès autorisé
  if (auth.isLoggedIn()) {
    return true;
  }

  //  Sinon redirection vers /auth/signin
  router.navigateByUrl('/auth/signin');
  return false;
};
