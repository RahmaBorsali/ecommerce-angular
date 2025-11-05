import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountWishlist } from './account-wishlist';

describe('AccountWishlist', () => {
  let component: AccountWishlist;
  let fixture: ComponentFixture<AccountWishlist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountWishlist]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountWishlist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
