import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KeypadKeyComponent } from 'player/modules/key-input/components/keypad-key/keypad-key.component';

describe('KeypadKeyComponent', () => {
  let component: KeypadKeyComponent;
  let fixture: ComponentFixture<KeypadKeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [KeypadKeyComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KeypadKeyComponent);
    component = fixture.componentInstance;
    component.key = 'a';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
