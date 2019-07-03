import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectSOWComponent } from './select-sow.component';

describe('SelectSOWComponent', () => {
  let component: SelectSOWComponent;
  let fixture: ComponentFixture<SelectSOWComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectSOWComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectSOWComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
