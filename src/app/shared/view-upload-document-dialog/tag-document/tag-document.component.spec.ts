import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagDocumentComponent } from './tag-document.component';

describe('TagDocumentComponent', () => {
  let component: TagDocumentComponent;
  let fixture: ComponentFixture<TagDocumentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagDocumentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
