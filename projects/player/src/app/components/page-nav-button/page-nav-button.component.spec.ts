import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageNavButtonComponent } from './page-nav-button.component';

describe('UnitNavButtonComponent', () => {
  let component: PageNavButtonComponent;
  let fixture: ComponentFixture<PageNavButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PageNavButtonComponent]
    });
    fixture = TestBed.createComponent(PageNavButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
