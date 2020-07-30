import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CdpfComponent } from './cdpf.component';

describe('CdpfComponent', () => {
  let component: CdpfComponent;
  let fixture: ComponentFixture<CdpfComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CdpfComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CdpfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
