import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BucketMasterdataComponent } from './bucket-masterdata.component';

describe('BucketMasterdataComponent', () => {
  let component: BucketMasterdataComponent;
  let fixture: ComponentFixture<BucketMasterdataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BucketMasterdataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BucketMasterdataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
