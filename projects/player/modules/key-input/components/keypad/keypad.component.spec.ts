import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KeypadComponent } from 'player/modules/key-input/components/keypad/keypad.component';
import { Component, Input } from '@angular/core';
import { KeyInputLayout, KeyLayout } from 'player/modules/key-input/configs/key-layout';
import { InputAssistanceCustomStyle, InputAssistancePreset } from 'common/interfaces';

describe('KeypadComponent', () => {
  let component: KeypadComponent;
  let fixture: ComponentFixture<KeypadComponent>;

  @Component({
    selector: 'aspect-keypad-layout',
    template: '',
    standalone: false
  })
  class KeypadLayoutComponent {
    @Input() preset!: InputAssistancePreset;
    @Input() layout!: KeyInputLayout;
    @Input() position!: 'floating' | 'right';
    @Input() inputElement!: HTMLTextAreaElement | HTMLInputElement;
    @Input() restrictToAllowedKeys!: boolean;
    @Input() hasArrowKeys!: boolean;
    @Input() hasReturnKey!: boolean;
    @Input() arrows!: string[];
    @Input() keyStyle!: 'round' | 'square';
    @Input() customStyle!: InputAssistanceCustomStyle;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        KeypadComponent,
        KeypadLayoutComponent
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KeypadComponent);
    component = fixture.componentInstance;
    component.preset = 'numbers';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize layout in ngOnInit', () => {
    const expectedLayout = KeyLayout.get('numbers', '', false);
    component.ngOnInit();
    expect(component.layout).toEqual(expectedLayout);
  });

  it('should emit select event for arrow keys', () => {
    spyOn(component.select, 'emit');
    component.evaluateClickedKeyValue('ArrowLeft');
    expect(component.select.emit).toHaveBeenCalledWith('ArrowLeft');
  });

  it('should emit backSpaceClicked event for Backspace key', () => {
    spyOn(component.backSpaceClicked, 'emit');
    component.evaluateClickedKeyValue('Backspace');
    expect(component.backSpaceClicked.emit).toHaveBeenCalled();
  });

  it('should emit keyClicked event for normal keys', () => {
    spyOn(component.keyClicked, 'emit');
    component.evaluateClickedKeyValue('a');
    expect(component.keyClicked.emit).toHaveBeenCalledWith('a');
  });
});
