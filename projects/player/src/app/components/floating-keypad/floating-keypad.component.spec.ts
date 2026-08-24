import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { UIElementType } from 'common/models/ui-element-interfaces';
import { KeypadService } from 'player/src/app/services/keypad.service';
import { FloatingKeypadComponent } from './floating-keypad.component';

describe('FloatingKeypadComponent', () => {
  let component: FloatingKeypadComponent;
  let fixture: ComponentFixture<FloatingKeypadComponent>;
  let keypadService: {
    preset: string | null;
    inputElement: { clientHeight: number };
    elementComponent: { elementModel: { type: UIElementType, inputAssistanceFloatingStartPosition: string } };
  };

  const openKeypad = (type: UIElementType, startPosition: 'startBottom' | 'endCenter'): void => {
    keypadService.elementComponent.elementModel = { type, inputAssistanceFloatingStartPosition: startPosition };
    component.isKeypadOpen = true;
    component.ngOnChanges({ isKeypadOpen: new SimpleChange(false, true, false) });
  };

  beforeEach(async () => {
    keypadService = {
      /* No preset keeps the overlay template empty; only the positioning logic is under test. */
      preset: null,
      inputElement: { clientHeight: 100 },
      elementComponent: { elementModel: { type: 'text-field', inputAssistanceFloatingStartPosition: 'startBottom' } }
    };

    await TestBed.configureTestingModule({
      imports: [OverlayModule],
      declarations: [FloatingKeypadComponent],
      providers: [{ provide: KeypadService, useValue: keypadService }]
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

  it('should start without overlay positions', () => {
    expect(component.overlayPositions).toEqual([]);
  });

  it('should offer a position below and above the input element', () => {
    openKeypad('text-field', 'startBottom');

    expect(component.overlayPositions.length).toBe(2);
    expect(component.overlayPositions[0].originY).toBe('bottom');
    expect(component.overlayPositions[1].originY).toBe('top');
  });

  it('should offset the keypad according to the element type', () => {
    openKeypad('text-field', 'startBottom');
    expect(component.overlayPositions.map(position => position.offsetY)).toEqual([22, -102]);

    openKeypad('text-field-simple', 'startBottom');
    expect(component.overlayPositions.map(position => position.offsetY)).toEqual([2, -76]);

    openKeypad('text-area', 'startBottom');
    expect(component.overlayPositions.map(position => position.offsetY)).toEqual([36, -90]);

    openKeypad('spell-correct', 'startBottom');
    expect(component.overlayPositions.map(position => position.offsetY)).toEqual([-34, -80]);
  });

  it('should not offset the keypad for other element types', () => {
    openKeypad('text', 'startBottom');

    expect(component.overlayPositions.map(position => position.offsetY)).toEqual([0, 0]);
  });

  it('should place the keypad next to the element for the centered start position', () => {
    openKeypad('text-field', 'endCenter');

    expect(component.overlayPositions).toEqual([{
      originX: 'end',
      originY: 'center',
      overlayX: 'start',
      overlayY: 'center'
    }]);
  });

  it('should keep the positions while the keypad is closed', () => {
    component.isKeypadOpen = false;

    component.ngOnChanges({ isKeypadOpen: new SimpleChange(true, false, false) });

    expect(component.overlayPositions).toEqual([]);
  });
});
