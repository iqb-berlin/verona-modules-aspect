import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClickableContainerComponent } from './clickable-container.component';

describe('ClickableContainerComponent', () => {
  let component: ClickableContainerComponent;
  let fixture: ComponentFixture<ClickableContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClickableContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClickableContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
