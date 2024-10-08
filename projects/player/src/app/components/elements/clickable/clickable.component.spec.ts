import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClickableComponent } from './clickable.component';

describe('ClickableComponent', () => {
  let component: ClickableComponent;
  let fixture: ComponentFixture<ClickableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClickableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClickableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
