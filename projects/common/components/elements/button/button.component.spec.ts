import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Directive, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonElement, ButtonProperties } from 'common/models/elements/button';
import { TooltipPosition } from 'common/models/ui-element-interfaces';
import { ButtonComponent } from './button.component';

@Directive({
  selector: '[pointerEventTooltip]',
  standalone: false
})
class MockPointerEventTooltipDirective {
  @Input() tooltipText!: string;
  @Input() tooltipPosition!: TooltipPosition;
}

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ButtonComponent,
        MockPointerEventTooltipDirective
      ],
      imports: [
        MatButtonModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    component.elementModel = new ButtonElement({
      type: 'button',
      id: 'test-id',
      alias: 'test-alias',
      label: 'Test Button',
      imageSrc: null,
      asLink: false,
      action: null,
      actionParam: null,
      tooltipText: '',
      tooltipPosition: 'below',
      labelAlignment: 'baseline'
    } as Partial<ButtonProperties>);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a button with its label', () => {
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button).not.toBeNull();
    expect(button.textContent).toContain('Test Button');
    expect(fixture.nativeElement.querySelector('a')).toBeNull();
  });

  it('should emit buttonActionEvent on click when action and param are set', () => {
    component.elementModel.action = 'pageNav';
    component.elementModel.actionParam = 2;
    fixture.detectChanges();
    const emitSpy = vi.spyOn(component.buttonActionEvent, 'emit');
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    expect(emitSpy).toHaveBeenCalledWith({ action: 'pageNav', param: 2 });
  });

  it('should not emit buttonActionEvent on click when action is null', () => {
    const emitSpy = vi.spyOn(component.buttonActionEvent, 'emit');
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should render an anchor element when asLink is set', () => {
    component.elementModel.asLink = true;
    component.elementModel.action = 'unitNav';
    component.elementModel.actionParam = 'next';
    fixture.detectChanges();
    const anchor = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    expect(anchor).not.toBeNull();
    expect(anchor.getAttribute('href')).toBe('unitNav-next');
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('should render an image input when imageSrc is set', () => {
    const imageSrc = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    component.elementModel.imageSrc = imageSrc;
    fixture.detectChanges();
    const imageInput = fixture.nativeElement.querySelector('input[type="image"]') as HTMLInputElement;
    expect(imageInput).not.toBeNull();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
    // Asserting that the input exists is not enough: it renders either way, and a src that
    // Angular refuses to unwrap ends up as the sanitizer's complaint in the attribute.
    expect(imageInput.getAttribute('src')).toBe(imageSrc);
  });

  /* The gap gives its children their line; here the host does, with a height to tell it apart from the
     36px a button used to inherit from the cloze (#1619). */
  describe('in a gap', () => {
    beforeEach(() => {
      component.clozeContext = true;
      (fixture.nativeElement as HTMLElement).style.lineHeight = '30px';
      fixture.detectChanges();
    });

    const link = (): HTMLElement => {
      component.elementModel.asLink = true;
      fixture.detectChanges();
      return fixture.nativeElement.querySelector('.link');
    };

    it('should mark the button and the link as standing in a gap', () => {
      expect(fixture.nativeElement.querySelector('button').classList).toContain('cloze-context');
      expect(link().classList).toContain('cloze-context');
    });

    it('should make a button its line plus 1px above and below', () => {
      expect((fixture.nativeElement.querySelector('button') as HTMLElement).getBoundingClientRect().height)
        .toBe(32);
    });

    it('should make a link its line plus 1px above and below', () => {
      expect(link().getBoundingClientRect().height).toBe(32);
    });

    it('should make a link as wide as its gap', () => {
      const anchor = link();
      (fixture.nativeElement as HTMLElement).style.width = '120px';

      expect(anchor.getBoundingClientRect().width).toBe(120);
    });

    /* Cut down to a gap lower than its line, the label ran from its top edge and its text stood 2.5px
       off the line the other gaps keep. */
    it('should keep a label cut down to a lower gap in its middle', () => {
      (fixture.nativeElement as HTMLElement).style.height = '16px';
      const button = fixture.nativeElement.querySelector('button') as HTMLElement;
      const label = button.querySelector('.mdc-button__label') as HTMLElement;
      const range = document.createRange();
      range.selectNodeContents(label);
      const text = range.getBoundingClientRect();
      const box = button.getBoundingClientRect();

      expect(label.getBoundingClientRect().height).toBeLessThanOrEqual(box.height);
      expect(Math.abs((text.top + text.bottom) / 2 - (box.top + box.bottom) / 2)).toBeLessThan(1);
    });

    it('should centre the label of a link in a taller gap', () => {
      const anchor = link();
      (fixture.nativeElement as HTMLElement).style.height = '50px';
      const range = document.createRange();
      range.selectNodeContents(anchor);
      const text = range.getBoundingClientRect();
      const box = anchor.getBoundingClientRect();

      /* Within a pixel: the range is the box of the font, which does not sit quite evenly in its line.
         Without the rule the label stood 7px above the middle. */
      expect(box.height).toBe(50);
      expect(Math.abs((text.top + text.bottom) / 2 - (box.top + box.bottom) / 2)).toBeLessThan(1);
    });
  });
});
