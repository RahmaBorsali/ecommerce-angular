import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService, User } from '../../../services/auth.service';
import { Footer } from "../../../shared/footer/footer";
import { Header } from "../../../shared/header/header";
import { AccountLayout } from "../account-layout/account-layout";

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Footer, Header, AccountLayout],
  templateUrl: './profile.html',
})
export class Profile implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  user = signal<User | null>(null);
  saving = false;
  message = '';

  form = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
    phone: [''],
    address: ['', [Validators.required, Validators.minLength(5)]],
    city: [''],
    country: [''],
    avatarUrl: [''],
  });

  ngOnInit(): void {
    const u = this.auth.currentUser();
    this.user.set(u);
    if (u) {
      this.form.patchValue({
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phone: (u as any).phone || '',
        address: u.address || '',
        city: (u as any).city || '',
        country: (u as any).country || '',
        avatarUrl: (u as any).avatarUrl || '',
      });
    }
  }

  onAvatarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => this.form.patchValue({ avatarUrl: reader.result as string });
    reader.readAsDataURL(file);
  }

  /** ✅ Sauvegarde du profil avec SweetAlert */
  async save(): Promise<void> {
    if (!this.user()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const confirm = await Swal.fire({
      title: 'Confirmer la modification',
      text: 'Souhaitez-vous enregistrer ces changements sur votre profil ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Oui, enregistrer',
      cancelButtonText: 'Annuler',
    });

    if (!confirm.isConfirmed) return;

    this.saving = true;
    const patch = this.form.getRawValue();

    // Si updateCurrent existe dans ton AuthService
    const updated = (this.auth as any).updateCurrent
      ? (this.auth as any).updateCurrent(patch)
      : this._manualUpdateCurrent(patch);

    this.user.set(updated);
    this.saving = false;

    await Swal.fire({
      icon: 'success',
      title: 'Profil mis à jour',
      text: 'Vos informations personnelles ont été enregistrées avec succès.',
      showConfirmButton: false,
      timer: 2000,
    });
  }

  /** Fallback si AuthService n’a pas updateCurrent() */
  private _manualUpdateCurrent(patch: any): User | null {
    const curr = this.auth.currentUser();
    if (!curr) return null;

    const users: User[] = (() => {
      try {
        return JSON.parse(localStorage.getItem('app.users') || '[]');
      } catch {
        return [];
      }
    })();

    const updated: User = { ...curr, ...patch } as User;
    const idx = users.findIndex((u) => u.id === curr.id);
    if (idx >= 0) users[idx] = updated;
    else users.push(updated);

    localStorage.setItem('app.users', JSON.stringify(users));
    return updated;
  }
}
