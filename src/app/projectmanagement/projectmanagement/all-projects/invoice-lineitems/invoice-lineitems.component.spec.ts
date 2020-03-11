import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceLineitemsComponent } from './invoice-lineitems.component';

describe('InvoiceLineitemsComponent', () => {
  let component: InvoiceLineitemsComponent;
  let fixture: ComponentFixture<InvoiceLineitemsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceLineitemsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceLineitemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
