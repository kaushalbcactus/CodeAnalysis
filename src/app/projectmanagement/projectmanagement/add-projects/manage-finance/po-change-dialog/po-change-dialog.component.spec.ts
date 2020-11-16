import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PoChangeDialogComponent } from './po-change-dialog.component';

describe('PoChangeDialogComponent', () => {
  let component: PoChangeDialogComponent;
  let fixture: ComponentFixture<PoChangeDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PoChangeDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PoChangeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
