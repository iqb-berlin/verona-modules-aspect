import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageScrollButtonComponent } from './page-scroll-button.component';

describe('PageScrollButtonComponent', () => {
  let component: PageScrollButtonComponent;
  let fixture: ComponentFixture<PageScrollButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PageScrollButtonComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageScrollButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
