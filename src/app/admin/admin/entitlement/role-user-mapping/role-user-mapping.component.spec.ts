import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleUserMappingComponent } from './role-user-mapping.component';

describe('RoleUserMappingComponent', () => {
  let component: RoleUserMappingComponent;
  let fixture: ComponentFixture<RoleUserMappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoleUserMappingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleUserMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
