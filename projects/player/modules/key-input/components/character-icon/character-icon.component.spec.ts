import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CharacterIconComponent } from './character-icon.component';

describe('CharacterIconComponent', () => {
  let component: CharacterIconComponent;
  let fixture: ComponentFixture<CharacterIconComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CharacterIconComponent]
    });
    fixture = TestBed.createComponent(CharacterIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should size itself with the default size', () => {
    expect(component.size).toBe(24);
    expect(fixture.nativeElement.style.fontSize).toBe('24px');
    expect(fixture.nativeElement.style.width).toBe('24px');
    expect(fixture.nativeElement.style.height).toBe('24px');
  });

  it('should size itself with the given size', () => {
    component.size = 40;

    fixture.detectChanges();

    expect(fixture.nativeElement.style.fontSize).toBe('40px');
    expect(fixture.nativeElement.style.lineHeight).toBe('40px');
  });

  it('should render a slot for the projected character', () => {
    expect(fixture.nativeElement.querySelector('span')).toBeTruthy();
  });
});
