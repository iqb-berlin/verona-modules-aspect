import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { KeyboardKeyComponent } from './keyboard-key.component';

describe('KeyboardKeyComponent', () => {
  let component: KeyboardKeyComponent;
  let fixture: ComponentFixture<KeyboardKeyComponent>;

  const keyButton = (): HTMLButtonElement => fixture.debugElement.query(By.css('.key')).nativeElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [KeyboardKeyComponent],
      imports: [MatButtonModule, MatIconModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyboardKeyComponent);
    component = fixture.componentInstance;
    component.key = 'a';
    component.alternativeKey = null;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show a single character key', () => {
    expect(fixture.debugElement.query(By.css('.character')).nativeElement.textContent.trim()).toBe('a');
    expect(keyButton().classList).not.toContain('control');
  });

  it('should show an alternative key next to the character', () => {
    component.alternativeKey = 'A';

    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.alternative-key')).nativeElement.textContent.trim()).toBe('A');
  });

  it('should mark multi character keys as control keys', () => {
    component.key = 'Backspace';

    fixture.detectChanges();

    expect(keyButton().classList).toContain('control');
    expect(fixture.debugElement.query(By.css('.character'))).toBeNull();
  });

  it('should not mark the space key as control key', () => {
    component.key = 'Space';

    fixture.detectChanges();

    expect(keyButton().classList).not.toContain('control');
  });

  it('should mark the close key as dark control key', () => {
    component.key = 'close';

    fixture.detectChanges();

    expect(keyButton().classList).toContain('dark-control');
  });

  it('should show an icon for every control key', () => {
    ['Return', 'Backspace', 'Shift', 'ShiftUp', 'Space', 'close'].forEach(key => {
      component.key = key;
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('.center-icon'))).toBeTruthy();
    });
  });

  it('should announce a clicked key', () => {
    const clickedKeys: string[] = [];
    component.keyClicked.subscribe(key => clickedKeys.push(key));

    keyButton().click();

    expect(clickedKeys).toEqual(['a']);
  });
});
