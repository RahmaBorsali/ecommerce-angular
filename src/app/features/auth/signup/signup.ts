import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { matchFieldsValidator } from '../../../shared/validators';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'app-signup',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.html',
})
export class Signup {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  error = '';

  //  états pour afficher/masquer
  showPwd = false;
  showConfirm = false;

  // Regex mot de passe fort
  private passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]|:;"'<>,.?/]).{8,}$/;

  form = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    address: ['', [Validators.required, Validators.minLength(5)]],
    passwordGroup: this.fb.group(
      {
        password: ['', [Validators.required, Validators.pattern(this.passwordPattern)]],
        confirm: ['', [Validators.required]],
      },
      { validators: matchFieldsValidator('password', 'confirm') }
    ),
  });

  get f() {
    return this.form.controls;
  }
  get pg(): FormGroup {
    return this.form.get('passwordGroup') as FormGroup;
  }

  togglePwd() {
    this.showPwd = !this.showPwd;
  }
  toggleConfirm() {
    this.showConfirm = !this.showConfirm;
  }

submit() {
  this.error = '';

  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const { firstName, lastName, email, address } = this.form.value;
  const password = this.pg.get('password')!.value as string;

  const payload = {
    firstName: firstName!,
    lastName:  lastName!,
    email:     email!,
    address:   address!,
    password,
  };

  // Désactiver le formulaire pendant l'appel
  this.form.disable();

  this.auth.register(payload).subscribe({
    next: (res) => {
      // On réactive le formulaire (au cas où tu restes sur la page)
      this.form.enable();

      // 🎉 SweetAlert de confirmation
      Swal.fire({
        title: 'Inscription presque terminée ✉️',
        text: "Nous t'avons envoyé un email de vérification. Clique sur le lien dans cet email pour activer ton compte.",
        icon: 'success',
        showCloseButton: true,             // ❌ X en haut à droite
        showCancelButton: true,            // bouton "Fermer"
        confirmButtonText: 'Ouvrir Gmail', // bouton principal
        cancelButtonText: 'Fermer',
      }).then((result) => {
        if (result.isConfirmed) {
          // Ouvre Gmail dans un nouvel onglet
          window.open('https://mail.google.com', '_blank');
        }
        // Après avoir fermé la popup, on va vers la page de connexion
        this.router.navigateByUrl('/auth/signin');
      });
    },
    error: (err) => {
      this.form.enable();

      if (err.error?.message) {
        this.error = err.error.message;
      } else {
        this.error = 'Inscription impossible. Réessayez.';
      }
    },
  });
}


}
