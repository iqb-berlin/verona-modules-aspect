import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { InputAssistancePreset } from 'common/models/input-element-interfaces';
import { GetAlternativeKeyPipe } from 'player/modules/key-input/pipes/get-alternative-key.pipe';
import { KeypadLayoutComponent } from 'player/modules/key-input/components/keypad-layout/keypad-layout.component';
import { GetLayoutClassPipe } from 'player/modules/key-input/pipes/get-layout-class.pipe';
import { KeyInputLayout } from 'player/modules/key-input/configs/key-layout';

describe('KeypadLayoutComponent', () => {
  let component: KeypadLayoutComponent;
  let fixture: ComponentFixture<KeypadLayoutComponent>;

  @Component({
    selector: 'aspect-keypad-key',
    template: '',
    standalone: false
  })
  class KeypadKeyComponent {
    @Input() key!: string;
    @Input() verticalKey!: boolean;
    @Input() horizontalKey!: boolean;
    @Input() bigHorizontalKey!: boolean;
    @Input() keyStyle!: 'round' | 'square';
    @Input() darkMode!: boolean;
    @Input() position!: 'floating' | 'right';
    @Input() singleKey!: boolean;
    @Input() preset!: InputAssistancePreset;
    @Output() keyClicked = new EventEmitter<string>();
  }

  const mockLayout: KeyInputLayout = {
    default: [['a', 'b'], ['c', 'Shift']],
    shift: [['A', 'B'], ['C', 'ShiftUp']],
    additional: [['1', '2']]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        KeypadLayoutComponent,
        KeypadKeyComponent,
        GetAlternativeKeyPipe,
        GetLayoutClassPipe
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KeypadLayoutComponent);
    component = fixture.componentInstance;
    component.layout = mockLayout;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize rows in ngOnInit', () => {
    component.ngOnInit();
    expect(component.rows).toEqual(mockLayout.default);
    expect(component.additionalRows).toEqual(mockLayout.additional);
  });

  /* Which keys may be typed is not the layout's business any more: the restriction hangs on the
     focused field, see KeyInputRestrictionService and KeyLayout.getAllowedKeys (#1143). */

  it('should emit keyClicked event when a normal key is clicked', () => {
    vi.spyOn(component.keyClicked, 'emit');
    component.evaluateClickedKeyValue('a');
    expect(component.keyClicked.emit).toHaveBeenCalledWith('a');
  });

  it('should toggle shift when "Shift" key is clicked', () => {
    expect(component.shift).toBe(false);
    component.evaluateClickedKeyValue('Shift');
    expect(component.shift).toBe(true);
    expect(component.rows).toEqual(mockLayout.shift);

    component.evaluateClickedKeyValue('ShiftUp');
    expect(component.shift).toBe(false);
    expect(component.rows).toEqual(mockLayout.default);
  });

  it('should toggle shift correctly using toggleShift method', () => {
    component.toggleShift();
    expect(component.shift).toBe(true);
    expect(component.rows).toEqual(mockLayout.shift);

    component.toggleShift();
    expect(component.shift).toBe(false);
    expect(component.rows).toEqual(mockLayout.default);
  });
});
