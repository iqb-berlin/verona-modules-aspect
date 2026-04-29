import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KeypadKeyComponent } from 'player/modules/key-input/components/keypad-key/keypad-key.component';
import { Component, Input } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

describe('KeypadKeyComponent', () => {
  let component: KeypadKeyComponent;
  let fixture: ComponentFixture<KeypadKeyComponent>;

  @Component({
    selector: 'character-icon',
    template: '<ng-content></ng-content>',
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
      ],
      imports: [
        MatIconModule,
        MatButtonModule
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KeypadKeyComponent);
    component = fixture.componentInstance;
    component.keyStyle = 'square';
    component.key = 'a';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit keyClicked event when button is clicked', () => {
    spyOn(component.keyClicked, 'emit');
    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();
    expect(component.keyClicked.emit).toHaveBeenCalledWith('a');
  });

  it('should render character-icon for single character keys', () => {
    component.key = 'b';
    fixture.detectChanges();
    const icon = fixture.debugElement.query(By.css('character-icon'));
    expect(icon).toBeTruthy();
    expect(icon.nativeElement.textContent).toBe('b');
  });

  it('should render mat-icon for special keys', () => {
    component.key = 'Backspace';
    fixture.detectChanges();
    const icon = fixture.debugElement.query(By.css('mat-icon'));
    expect(icon).toBeTruthy();
    expect(icon.nativeElement.textContent).toBe('backspace');
  });

  it('should apply correct classes based on position and keyStyle', () => {
    component.position = 'right';
    component.keyStyle = 'square';
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.classList).toContain('fixed-keypad-key');
    expect(button.nativeElement.classList).toContain('square-key');

    component.keyStyle = 'round';
    fixture.detectChanges();
    const roundButton = fixture.debugElement.query(By.css('button'));
    expect(roundButton.nativeElement.classList).toContain('round-key');
  });

  it('should apply dark mode class when darkMode is true', () => {
    component.darkMode = true;
    component.keyStyle = 'square';
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.classList).toContain('square-dark-mode');

    component.keyStyle = 'round';
    fixture.detectChanges();
    const roundButton = fixture.debugElement.query(By.css('button'));
    expect(roundButton.nativeElement.classList).toContain('round-dark-mode');
  });
});
