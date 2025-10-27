import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriesGrid } from './categories-grid';

describe('CategoriesGrid', () => {
  let component: CategoriesGrid;
  let fixture: ComponentFixture<CategoriesGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesGrid]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoriesGrid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
