import { TestBed } from '@angular/core/testing';

import { FakeStore } from './fakestore';

describe('Fakestore', () => {
  let service: FakeStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FakeStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
