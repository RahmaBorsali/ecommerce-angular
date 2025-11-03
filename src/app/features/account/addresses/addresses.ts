import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth.service';

type Address = {
  id: string;
  userId: string;   // 🔑 propriétaire de l’adresse
  fullName: string;
  line1: string;
  city?: string;
  country?: string;
  isDefault?: boolean;
};

const LS_ADDR = 'app.addresses';

@Component({
  standalone: true,
  selector: 'app-account-addresses',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './addresses.html',
})
export class AccountAddresses implements OnInit {
  private fb   = inject(FormBuilder);
  private auth = inject(AuthService);

  addresses = signal<Address[]>([]);
  editId    = signal<string | null>(null);

  // Champs simples : nom + adresse requis, ville/pays facultatifs, "par défaut" optionnel
  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    line1:    ['', [Validators.required, Validators.minLength(4)]],
    city:     [''],
    country:  ['Tunisie'],
    isDefault:['' as any] // booléen; si tu veux: [false]
  });

  ngOnInit(): void {
    this.refreshList();
  }

  /** Recharge les adresses du user connecté */
  private refreshList(): void {
    const user = this.auth.currentUser();
    if (!user) {
      this.addresses.set([]);
      return;
    }
    const all: Address[] = JSON.parse(localStorage.getItem(LS_ADDR) || '[]');
    this.addresses.set(all.filter(a => a.userId === user.id));
  }

  startAdd(): void {
    const user = this.auth.currentUser();
    this.editId.set('new');
    this.form.reset({
      fullName: user ? `${user.firstName} ${user.lastName ?? ''}`.trim() : '',
      line1: '',
      city: '',
      country: 'Tunisie',
      isDefault: false as any
    });
  }

  startEdit(a: Address): void {
    this.editId.set(a.id);
    this.form.reset({
      fullName: a.fullName,
      line1: a.line1,
      city: a.city ?? '',
      country: a.country ?? 'Tunisie',
      isDefault: !!a.isDefault as any
    });
  }

  cancel(): void {
    this.editId.set(null);
  }

  /** Sauvegarde avec confirmation SweetAlert */
  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const user = this.auth.currentUser();
    if (!user) return;

    const result = await Swal.fire({
      title: 'Confirmer la sauvegarde',
      text: 'Voulez-vous enregistrer cette adresse ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Oui, enregistrer',
      cancelButtonText: 'Annuler',
    });

    if (!result.isConfirmed) return;

    // On isole les champs saisis pour éviter les doublons id/userId
    const raw = this.form.getRawValue();
    const value = {
      fullName: (raw.fullName ?? '').trim(),
      line1:    (raw.line1 ?? '').trim(),
      city:     (raw.city ?? '').trim() || undefined,
      country:  (raw.country ?? '').trim() || undefined,
      isDefault: !!raw.isDefault,
    };

    // Lecture globale
    const all: Address[] = JSON.parse(localStorage.getItem(LS_ADDR) || '[]');
    // Sous-ensemble du user
    let mine = all.filter(a => a.userId === user.id);

    if (this.editId() === 'new') {
      const newAddr: Address = {
        id: crypto.randomUUID(),
        userId: user.id,
        ...value,
      };
      if (newAddr.isDefault) {
        mine = mine.map(a => ({ ...a, isDefault: false }));
      }
      mine.unshift(newAddr);
    } else {
      const idx = mine.findIndex(a => a.id === this.editId());
      if (idx >= 0) {
        if (value.isDefault) {
          mine = mine.map(a => ({ ...a, isDefault: a.id === this.editId() }));
        }
        // ⚠️ pas de réécriture de id/userId
        mine[idx] = { ...mine[idx], ...value };
      }
    }

    // Réassemble tout (mes adresses modifiées + celles des autres users)
    const others = all.filter(a => a.userId !== user.id);
    localStorage.setItem(LS_ADDR, JSON.stringify([...others, ...mine]));

    await Swal.fire({
      icon: 'success',
      title: 'Enregistré',
      text: 'Votre adresse a été sauvegardée.',
      timer: 1400,
      showConfirmButton: false,
    });

    this.refreshList();
    this.cancel();
  }

  /** Suppression avec confirmation SweetAlert */
  async remove(a: Address): Promise<void> {
    const result = await Swal.fire({
      title: 'Supprimer cette adresse ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    });

    if (!result.isConfirmed) return;

    const user = this.auth.currentUser();
    if (!user) return;

    const all: Address[] = JSON.parse(localStorage.getItem(LS_ADDR) || '[]');
    const next = all.filter(x => !(x.userId === user.id && x.id === a.id));
    localStorage.setItem(LS_ADDR, JSON.stringify(next));

    this.refreshList();

    Swal.fire({
      icon: 'success',
      title: 'Supprimée',
      text: 'Adresse supprimée avec succès.',
      timer: 1200,
      showConfirmButton: false,
    });
  }

  setDefault(a: Address): void {
    const user = this.auth.currentUser();
    if (!user) return;

    const all: Address[] = JSON.parse(localStorage.getItem(LS_ADDR) || '[]');
    const next = all.map(x =>
      x.userId === user.id ? { ...x, isDefault: x.id === a.id } : x
    );
    localStorage.setItem(LS_ADDR, JSON.stringify(next));
    this.refreshList();
  }
}
