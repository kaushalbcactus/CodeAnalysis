import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockTimeDialogComponent } from './block-time-dialog.component';

describe('BlockTimeDialogComponent', () => {
  let component: BlockTimeDialogComponent;
  let fixture: ComponentFixture<BlockTimeDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlockTimeDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockTimeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
