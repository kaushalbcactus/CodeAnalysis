import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveYourViewComponent } from './save-your-view.component';

describe('SaveYourViewComponent', () => {
  let component: SaveYourViewComponent;
  let fixture: ComponentFixture<SaveYourViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaveYourViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveYourViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
