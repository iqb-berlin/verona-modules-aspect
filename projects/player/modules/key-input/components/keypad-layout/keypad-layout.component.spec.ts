import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { InputAssistancePreset } from 'common/interfaces';
import { GetAlternativeKeyPipe } from 'player/modules/key-input/pipes/get-alternative-key.pipe';
import { KeypadLayoutComponent } from 'player/modules/key-input/components/keypad-layout/keypad-layout.component';

describe('KeypadLayoutComponent', () => {
  let component: KeypadLayoutComponent;
  let fixture: ComponentFixture<KeypadLayoutComponent>;

  @Component({
    selector: 'aspect-keypad-key', template: '',
    standalone: false
})
  class KeypadKeyComponent {
    @Input() key!: string;
    @Input() verticalOval!: boolean;
    @Input() horizontalOval!: boolean;
    @Input() bigHorizontalOval!: boolean;
    @Input() darkMode!: boolean;
    @Input() position!: 'floating' | 'right';
    @Input() singleKey!: boolean;
    @Input() preset!: InputAssistancePreset;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        KeypadLayoutComponent,
        KeypadKeyComponent,
        GetAlternativeKeyPipe
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KeypadLayoutComponent);
    component = fixture.componentInstance;
    component.inputElement = document.createElement('input');
    component.layout = {
      default: [[]],
      shift: [[]],
      additional: [[]]
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
