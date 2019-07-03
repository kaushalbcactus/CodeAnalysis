import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageFinanceComponent } from './manage-finance.component';

describe('ManageFinanceComponent', () => {
  let component: ManageFinanceComponent;
  let fixture: ComponentFixture<ManageFinanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageFinanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageFinanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
