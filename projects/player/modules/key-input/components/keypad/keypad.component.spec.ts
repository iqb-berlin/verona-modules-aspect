import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KeypadComponent } from 'player/modules/key-input/components/keypad/keypad.component';
import { Component, Input } from '@angular/core';
import { InputAssistancePreset } from 'common/models/elements/element';
import { KeyInputLayout } from 'player/modules/key-input/configs/key-layout';

describe('KeypadComponent', () => {
  let component: KeypadComponent;
  let fixture: ComponentFixture<KeypadComponent>;
  @Component({ selector: 'aspect-keypad-layout', template: '' })
  class KeypadLayoutComponent {
    @Input() preset!: InputAssistancePreset;
    @Input() layout!: KeyInputLayout;
    @Input() position!: 'floating' | 'right';
    @Input() inputElement!: HTMLTextAreaElement | HTMLInputElement;
    @Input() restrictToAllowedKeys!: boolean;
    @Input() hasArrowKeys!: boolean;
    @Input() hasReturnKey!: boolean;
    @Input() arrows!: string[];
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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
