import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoveAccessComponent } from './remove-access.component';

describe('RemoveAccessComponent', () => {
  let component: RemoveAccessComponent;
  let fixture: ComponentFixture<RemoveAccessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RemoveAccessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoveAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
