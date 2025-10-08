import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KeypadKeyComponent } from 'player/modules/key-input/components/keypad-key/keypad-key.component';
import { Component, Input } from '@angular/core';

describe('KeypadKeyComponent', () => {
  let component: KeypadKeyComponent;
  let fixture: ComponentFixture<KeypadKeyComponent>;

  @Component({
    selector: 'character-icon', template: '',
    standalone: false
})
  class MockedCharacterIconComponent {
    @Input() size!: number;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        KeypadKeyComponent,
        MockedCharacterIconComponent
      ]
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
