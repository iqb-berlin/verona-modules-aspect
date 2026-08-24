import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MarkableDelimiterComponent } from './markable-delimiter.component';

describe('MarkableDelimiterComponent', () => {
  let component: MarkableDelimiterComponent;
  let fixture: ComponentFixture<MarkableDelimiterComponent>;

  const delimiter = (): HTMLElement => fixture.debugElement.query(By.css('span')).nativeElement;

  const setColors = (color: string | null, neighbourColor: string | null): void => {
    component.color = color;
    component.neighbourColor = neighbourColor;
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MarkableDelimiterComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(MarkableDelimiterComponent);
    component = fixture.componentInstance;
    component.text = ' ';
    component.color = null;
    component.neighbourColor = null;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show its text', () => {
    component.text = ', ';

    fixture.detectChanges();

    expect(delimiter().textContent).toBe(', ');
  });

  it('should close the gap between two words of the same marking colour', () => {
    setColors('yellow', 'yellow');

    expect(delimiter().style.backgroundColor).toBe('yellow');
  });

  it('should stay unmarked between words of different marking colours', () => {
    setColors('yellow', 'blue');

    expect(delimiter().style.backgroundColor).toBe('');
  });

  it('should stay unmarked without a neighbouring marking', () => {
    setColors('yellow', null);

    expect(delimiter().style.backgroundColor).toBe('');
  });

  it('should stay unmarked without an own marking', () => {
    setColors(null, 'yellow');

    expect(delimiter().style.backgroundColor).toBe('');
  });
});
