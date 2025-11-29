import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-signin',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signin.html',
})
export class Signin {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  error = '';
  loading = false;
  showPassword = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    remember: [false],
  });

  get f() {
    return this.form.controls;
  }

  ngOnInit() {
    const remembered = localStorage.getItem('remember.login');
    if (remembered) {
      const { email, password } = JSON.parse(remembered);
      this.form.patchValue({ email, password, remember: true });
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  submit() {
    this.error = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password, remember } = this.form.value as {
      email: string;
      password: string;
      remember: boolean;
    };

    this.loading = true;
    this.form.disable();

    //  APPEL AU BACKEND
    this.auth.login(email, password).subscribe({
      next: (res) => {
        // remember me
        if (remember) {
          localStorage.setItem(
            'remember.login',
            JSON.stringify({ email, password })
          );
        } else {
          localStorage.removeItem('remember.login');
        }

        this.router.navigateByUrl('/home');
      },
      error: (err) => {
        this.form.enable();
        this.loading = false;

        const msg = err?.error?.message;

        if (msg === 'Compte non vérifié. Merci de vérifier votre email avant de vous connecter.') {
          this.error = 'Compte non vérifié. Vérifie ton email avant de te connecter.';
        } else if (msg === 'Email ou mot de passe incorrect.') {
          this.error = 'Email ou mot de passe incorrect.';
        } else {
          this.error = 'Connexion impossible. Réessaye.';
        }
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
