import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService, User } from '../../../services/auth.service';
import { Footer } from '../../../shared/footer/footer';
import { Header } from '../../../shared/header/header';
import { AccountLayout } from '../account-layout/account-layout';

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
  avatarSrc = signal<string | null>(null);   // 👈 source unique pour l’image
  saving = false;
  message: string | null = null;

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
    const sessionUser = this.auth.currentUser();
    if (!sessionUser) {
      this.user.set(null);
      return;
    }

    // 1) Ce qu’on a déjà en session
    this.user.set(sessionUser);
    this.avatarSrc.set(sessionUser.avatarUrl ?? null);  // 👈 avatar actuel

    this.form.patchValue({
      firstName: sessionUser.firstName,
      lastName: sessionUser.lastName,
      email: sessionUser.email,
      phone: sessionUser.phone || '',
      address: sessionUser.address || '',
      city: sessionUser.city || '',
      country: sessionUser.country || '',
      avatarUrl: sessionUser.avatarUrl || '',
    });

    // 2) Rafraîchir avec le backend
    this.auth.getProfile(sessionUser.id).subscribe({
      next: (apiUser: any) => {
        const normalized: User = {
          ...apiUser,
          id: apiUser.id ?? apiUser._id ?? sessionUser.id,
        };

        this.user.set(normalized);
        this.auth.setCurrentUser(normalized);

        this.avatarSrc.set(normalized.avatarUrl ?? null);  // 👈 URL depuis l’API

        this.form.patchValue({
          firstName: normalized.firstName,
          lastName: normalized.lastName,
          email: normalized.email,
          phone: normalized.phone || '',
          address: normalized.address || '',
          city: normalized.city || '',
          country: normalized.country || '',
          avatarUrl: normalized.avatarUrl || '',
        });
      },
      error: (err) => console.error('getProfile error', err),
    });
  }

onAvatarChange(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (!input.files || !input.files[0]) return;

  const file = input.files[0];
  const u = this.user();
  if (!u) return;

  // preview
  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result as string;
    this.form.patchValue({ avatarUrl: dataUrl });
    this.user.set({ ...u, avatarUrl: dataUrl });
  };
  reader.readAsDataURL(file);

  // upload
  this.auth.uploadAvatar(u.id, file).subscribe({
    next: (res) => {
      if (res.user?.avatarUrl) {
        const normalized: User = {
          ...res.user,
          id: (res.user as any).id ?? (res.user as any)._id ?? u.id,
        };
        this.user.set(normalized);
        this.auth.setCurrentUser(normalized);
        this.form.patchValue({ avatarUrl: normalized.avatarUrl || '' });
      }
    },
    error: (err) => {
      console.error('updateAvatar error', err);
      Swal.fire({
        icon: 'error',
        title: "Impossible de mettre à jour l'avatar",
        text: 'Réessayez plus tard.',
      });
    },
  });
}


  async save() {
    const u = this.user();
    if (!u) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const confirm = await Swal.fire({
      title: 'Confirmer la modification',
      text: 'Souhaitez-vous enregistrer ces changements ?',
      icon: 'question',
      showCancelButton: true,
    });

    if (!confirm.isConfirmed) return;

    this.saving = true;

    const raw = this.form.getRawValue();
    const patch = {
      firstName: raw.firstName!,
      lastName: raw.lastName!,
      address: raw.address || '',
      city: raw.city || '',
      country: raw.country || '',
      phone: raw.phone || '',
    };

    this.auth.updateProfile(u.id, patch).subscribe({
      next: (updated: any) => {
        const normalized: User = {
          ...updated,
          id: updated.id ?? updated._id ?? u.id,
        };
        this.user.set(normalized);
        this.auth.setCurrentUser(normalized);

        this.saving = false;
        Swal.fire('Succès', 'Profil mis à jour', 'success');
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Erreur', 'Impossible de mettre à jour', 'error');
        this.saving = false;
      },
    });
  }
}
