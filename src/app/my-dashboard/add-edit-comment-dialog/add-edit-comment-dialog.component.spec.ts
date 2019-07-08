import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditCommentComponent } from './add-edit-comment-dialog.component';

describe('AddEditCommentComponent', () => {
  let component: AddEditCommentComponent;
  let fixture: ComponentFixture<AddEditCommentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditCommentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
