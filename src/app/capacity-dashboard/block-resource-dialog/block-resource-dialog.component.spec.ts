import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockResourceDialogComponent } from './block-resource-dialog.component';

describe('BlockResourceDialogComponent', () => {
  let component: BlockResourceDialogComponent;
  let fixture: ComponentFixture<BlockResourceDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlockResourceDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockResourceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
