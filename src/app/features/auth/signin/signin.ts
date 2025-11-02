import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }      from '@angular/material/input';
import { MatButtonModule }     from '@angular/material/button';
import { MatIconModule }       from '@angular/material/icon';
import { AuthFakeStore } from '../../../services/auth-fakestore';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './signin.html',
  styleUrls: ['./signin.scss'],
})
export class Signin implements OnInit {
  private fb      = inject(FormBuilder);
  private auth    = inject(AuthFakeStore);
  private router  = inject(Router);

  hide = true;
  loading = false;
  error = '';
  successMessage = '';

  authForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    rememberMe: [false],
  });

  ngOnInit(): void {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPass  = localStorage.getItem('rememberedPassword');
    if (savedEmail && savedPass) {
      this.authForm.patchValue({
        username: savedEmail,
        password: savedPass,
        rememberMe: true,
      });
    }
  }

  onSubmit() {
    this.error = '';
    this.successMessage = '';

    if (this.authForm.invalid) {
      this.error = 'Veuillez remplir tous les champs.';
      return;
    }

    const { username, password, rememberMe } = this.authForm.getRawValue() as {
      username: string; password: string; rememberMe: boolean;
    };

    this.loading = true;

    // Remember me
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', username);
      localStorage.setItem('rememberedPassword', password);
    } else {
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberedPassword');
    }

    this.auth.login(username, password).subscribe({
      next: ({ token }) => {
        localStorage.setItem('accessToken', token);
        // Optionnel : stocker un user factice
        localStorage.setItem('currentUser', JSON.stringify({ username }));

        this.loading = false;
        this.successMessage = 'Connexion réussie !';
        this.router.navigate(['/']); // redirection (home)
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Échec de connexion. Réessayez.';
      },
    });
  }
}
