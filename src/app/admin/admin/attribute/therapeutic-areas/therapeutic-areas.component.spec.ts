import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TherapeuticAreasComponent } from './therapeutic-areas.component';

describe('TherapeuticAreasComponent', () => {
  let component: TherapeuticAreasComponent;
  let fixture: ComponentFixture<TherapeuticAreasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TherapeuticAreasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TherapeuticAreasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
