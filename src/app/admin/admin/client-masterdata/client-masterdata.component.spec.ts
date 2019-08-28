import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientMasterdataComponent } from './client-masterdata.component';

describe('ClientMasterdataComponent', () => {
  let component: ClientMasterdataComponent;
  let fixture: ComponentFixture<ClientMasterdataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientMasterdataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientMasterdataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
