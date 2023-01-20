import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KeyboardComponent } from 'player/modules/key-input/components/keyboard/keyboard.component';
import { Component, Input } from '@angular/core';
import { GetAlternativeKeyPipe } from 'player/modules/key-input/pipes/get-alternative-key.pipe';

describe('KeyboardComponent', () => {
  let component: KeyboardComponent;
  let fixture: ComponentFixture<KeyboardComponent>;

  @Component({ selector: 'keyboard-key', template: '' })
  class KeyboardKeyComponent {
    @Input() key!: string;
    @Input() alternativeKey!: string;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        KeyboardComponent,
        KeyboardKeyComponent,
        GetAlternativeKeyPipe
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
