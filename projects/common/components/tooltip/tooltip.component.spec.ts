import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SafeResourceHTMLPipe } from 'common/pipes/safe-resource-html.pipe';
import { TooltipComponent } from './tooltip.component';

describe('TooltipComponent', () => {
  let component: TooltipComponent;
  let fixture: ComponentFixture<TooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TooltipComponent, SafeResourceHTMLPipe]
    }).compileComponents();

    fixture = TestBed.createComponent(TooltipComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render plain text tooltips', () => {
    component.tooltipText = 'some text';
    fixture.detectChanges();
    const tooltipText = fixture.nativeElement.querySelector('.tooltip-text');
    expect(tooltipText.textContent).toContain('some text');
  });

  it('should render formatted tooltip markup', () => {
    component.tooltipText = '<p>some <strong>bold</strong> text</p>';
    fixture.detectChanges();
    const tooltipText = fixture.nativeElement.querySelector('.tooltip-text');
    expect(tooltipText.querySelector('strong')?.textContent).toBe('bold');
    expect(tooltipText.textContent).toContain('some bold text');
  });
});
