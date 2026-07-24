import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextMarkingButtonSvgComponent } from './text-marking-button-svg.component';

describe('TextMarkingButtonSvgComponent', () => {
  let component: TextMarkingButtonSvgComponent;
  let fixture: ComponentFixture<TextMarkingButtonSvgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TextMarkingButtonSvgComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TextMarkingButtonSvgComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.buttonType = 'selection';
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render exactly one icon for every button type', () => {
    const buttonTypes: ('selection' | 'word' | 'range' | 'delete')[] = ['selection', 'word', 'range', 'delete'];
    buttonTypes.forEach(buttonType => {
      component.buttonType = buttonType;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('svg').length).toBe(1);
    });
  });

  it('should render the delete icon for the delete button type', () => {
    component.buttonType = 'delete';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('svg polygon')).not.toBeNull();
  });

  it('should render a marker icon without polygon for the selection button type', () => {
    component.buttonType = 'selection';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('svg polygon')).toBeNull();
    expect(fixture.nativeElement.querySelector('svg path')).not.toBeNull();
  });

  it('should switch the icon when the button type changes', () => {
    component.buttonType = 'word';
    fixture.detectChanges();
    const wordPath = fixture.nativeElement.querySelector('svg path')?.getAttribute('d');

    component.buttonType = 'range';
    fixture.detectChanges();
    const rangePath = fixture.nativeElement.querySelector('svg path')?.getAttribute('d');

    expect(wordPath).toBeDefined();
    expect(rangePath).toBeDefined();
    expect(wordPath).not.toBe(rangePath);
  });
});
