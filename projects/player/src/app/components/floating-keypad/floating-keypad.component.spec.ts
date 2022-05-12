import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FloatingKeypadComponent } from './floating-keypad.component';

describe('FloatingKeypadComponent', () => {
  let component: FloatingKeypadComponent;
  let fixture: ComponentFixture<FloatingKeypadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FloatingKeypadComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FloatingKeypadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
