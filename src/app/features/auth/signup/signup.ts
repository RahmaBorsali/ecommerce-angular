import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { matchFieldsValidator } from '../../../shared/validators';

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

  // 👁 états pour afficher/masquer
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

    try {
      this.auth.register({
        firstName: firstName!,
        lastName:  lastName!,
        email:     email!,
        address:   address!,
        password,
      });
      this.form.disable(); // UX
      this.router.navigateByUrl('/auth/signin');
    } catch (e: any) {
      this.error =
        e?.message === 'EMAIL_EXISTS'
          ? 'Cet email est déjà utilisé.'
          : 'Inscription impossible. Réessayez.';
    }
  }
}
