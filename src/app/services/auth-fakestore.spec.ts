import { TestBed } from '@angular/core/testing';

import { AuthFakeStore } from './auth-fakestore';

describe('AuthFakestore', () => {
  let service: AuthFakeStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthFakeStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
