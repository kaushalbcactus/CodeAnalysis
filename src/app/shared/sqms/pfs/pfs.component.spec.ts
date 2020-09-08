import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PfsComponent } from './pfs.component';

describe('PfsComponent', () => {
  let component: PfsComponent;
  let fixture: ComponentFixture<PfsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PfsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PfsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
