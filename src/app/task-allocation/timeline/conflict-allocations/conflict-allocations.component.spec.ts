import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConflictAllocationsComponent } from './conflict-allocations.component';

describe('ConflictAllocationsComponent', () => {
  let component: ConflictAllocationsComponent;
  let fixture: ComponentFixture<ConflictAllocationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConflictAllocationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConflictAllocationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
