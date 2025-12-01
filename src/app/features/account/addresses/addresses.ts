import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth.service';
import { AddressService, Address, CreateAddressDto } from '../../../services/address.service';

@Component({
  standalone: true,
  selector: 'app-account-addresses',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './addresses.html',
})
export class AccountAddresses implements OnInit {
  private fb   = inject(FormBuilder);
  private auth = inject(AuthService);
  private addrSvc = inject(AddressService);

  addresses = signal<Address[]>([]);
  editId    = signal<string | null>(null); // 'new' ou _id Mongo

  form = this.fb.group({
    label:      ['Maison'],
    firstName:  ['', [Validators.required, Validators.minLength(2)]],
    lastName:   ['', [Validators.required, Validators.minLength(2)]],
    phone:      ['', [Validators.required, Validators.minLength(6)]],
    line1:      ['', [Validators.required, Validators.minLength(4)]],
    line2:      [''],
    city:       ['', [Validators.required]],
    postalCode: ['', [Validators.required]],
    country:    ['Tunisie', [Validators.required]],
    isDefault:  [false],
  });

  ngOnInit(): void {
    this.loadAddresses();
  }

  private loadAddresses(): void {
    const user = this.auth.currentUser();
    if (!user?.id) {
      this.addresses.set([]);
      return;
    }

    this.addrSvc.getByUser(user.id).subscribe({
      next: (list) => this.addresses.set(list || []),
      error: (err) => {
        console.error('getByUser error', err);
        this.addresses.set([]);
      },
    });
  }

  startAdd(): void {
    const user = this.auth.currentUser();
    if (!user?.id) return;

    this.editId.set('new');
    this.form.reset({
      label: 'Maison',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: '',
      line1: '',
      line2: '',
      city: '',
      postalCode: '',
      country: 'Tunisie',
      isDefault: this.addresses().length === 0, // première adresse => par défaut
    });
  }

  startEdit(a: Address): void {
    this.editId.set(a._id);
    this.form.reset({
      label: a.label || 'Adresse',
      firstName: a.firstName,
      lastName: a.lastName,
      phone: a.phone,
      line1: a.line1,
      line2: a.line2 || '',
      city: a.city,
      postalCode: a.postalCode,
      country: a.country || 'Tunisie',
      isDefault: !!a.isDefault,
    });
  }

  cancel(): void {
    this.editId.set(null);
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const user = this.auth.currentUser();
    if (!user?.id) return;

    const confirm = await Swal.fire({
      title: 'Confirmer la sauvegarde',
      text: 'Voulez-vous enregistrer cette adresse ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Oui, enregistrer',
      cancelButtonText: 'Annuler',
    });

    if (!confirm.isConfirmed) return;

    const raw = this.form.getRawValue();
    const dto: CreateAddressDto = {
      userId: user.id,
      label: raw.label || undefined,
      firstName: raw.firstName!.trim(),
      lastName: raw.lastName!.trim(),
      phone: raw.phone!.trim(),
      line1: raw.line1!.trim(),
      line2: raw.line2?.trim() || undefined,
      city: raw.city!.trim(),
      postalCode: raw.postalCode!.trim(),
      country: (raw.country || 'Tunisie').trim(),
      isDefault: !!raw.isDefault,
    };

    const isNew = this.editId() === 'new';
    const id = this.editId();

    const req$ = isNew
      ? this.addrSvc.create(dto)
      : this.addrSvc.update(id as string, {
          label: dto.label,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          line1: dto.line1,
          line2: dto.line2,
          city: dto.city,
          postalCode: dto.postalCode,
          country: dto.country,
          isDefault: dto.isDefault,
        });

    req$.subscribe({
      next: async () => {
        await Swal.fire({
          icon: 'success',
          title: 'Enregistré',
          text: 'Votre adresse a été sauvegardée.',
          timer: 1400,
          showConfirmButton: false,
        });
        this.loadAddresses();
        this.cancel();
      },
      error: async (err) => {
        console.error('save address error', err);
        await Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: "Impossible d'enregistrer l'adresse.",
        });
      },
    });
  }

  async remove(a: Address): Promise<void> {
    const confirm = await Swal.fire({
      title: 'Supprimer cette adresse ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    });

    if (!confirm.isConfirmed) return;

    this.addrSvc.delete(a._id).subscribe({
      next: async () => {
        await Swal.fire({
          icon: 'success',
          title: 'Supprimée',
          text: 'Adresse supprimée avec succès.',
          timer: 1200,
          showConfirmButton: false,
        });
        this.loadAddresses();
      },
      error: async (err) => {
        console.error('delete address error', err);
        await Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: "Impossible de supprimer l'adresse.",
        });
      },
    });
  }

  setDefault(a: Address): void {
    this.addrSvc.setDefault(a._id).subscribe({
      next: () => this.loadAddresses(),
      error: (err) => console.error('setDefault error', err),
    });
  }
}
