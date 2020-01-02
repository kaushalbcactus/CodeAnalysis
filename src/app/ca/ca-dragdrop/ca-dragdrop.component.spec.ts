import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CaDragdropComponent } from './ca-dragdrop.component';

describe('CaDragdropComponent', () => {
  let component: CaDragdropComponent;
  let fixture: ComponentFixture<CaDragdropComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CaDragdropComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaDragdropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
