// eslint-disable-next-line max-classes-per-file
import {
  ComponentFixture, TestBed
} from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  Component, Input, Pipe, PipeTransform
} from '@angular/core';
import {
  ToggleButtonElement, ToggleButtonProperties
} from 'common/models/elements/toggle-button';
import { InputElement } from 'common/models/elements/element';
import { SafeResourceHTMLPipe } from 'common/pipes/safe-resource-html.pipe';
import { IsDisabledDirective } from 'common/directives/is-disabled.directive';
import { ToggleButtonComponent } from './toggle-button.component';

@Component({
  selector: 'aspect-cloze-child-error-message',
  template: '',
  standalone: false
})
class MockClozeChildErrorMessageComponent {
  @Input() elementModel!: InputElement;
  @Input() elementFormControl!: UntypedFormControl;
}

@Pipe({ name: 'errorTransform', standalone: false })
class MockErrorTransformPipe implements PipeTransform {
  transform(): string { return 'Error'; }
}

/** One line of the font `element` renders in, at normal line height: what a gap is made of (#1619). */
const normalLineOf = (element: HTMLElement): number => {
  const style = getComputedStyle(element);
  const probe = document.createElement('span');
  probe.style.cssText = `display: inline-block; line-height: normal; font-family: ${style.fontFamily};
    font-size: ${style.fontSize};`;
  probe.textContent = 'Wort';
  document.body.appendChild(probe);
  const height = probe.getBoundingClientRect().height;
  probe.remove();
  return height;
};

describe('ToggleButtonComponent', () => {
  let component: ToggleButtonComponent;
  let fixture: ComponentFixture<ToggleButtonComponent>;

  const createToggleButtonElement = (
    properties: Partial<ToggleButtonProperties> = {}
  ): ToggleButtonElement => new ToggleButtonElement({
    type: 'toggle-button',
    id: 'test-id',
    alias: 'test-alias',
    options: [{ text: 'Option A' }, { text: 'Option B' }],
    ...properties
  } as Partial<ToggleButtonProperties>);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ToggleButtonComponent,
        MockClozeChildErrorMessageComponent,
        MockErrorTransformPipe,
        SafeResourceHTMLPipe,
        IsDisabledDirective
      ],
      imports: [
        ReactiveFormsModule,
        MatButtonToggleModule,
        MatTooltipModule
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ToggleButtonComponent);
    component = fixture.componentInstance;
    component.elementModel = createToggleButtonElement();
    component.parentForm = new UntypedFormGroup({
      'test-id': new UntypedFormControl(null)
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render one toggle per option with its text', () => {
    const toggles: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('mat-button-toggle');
    expect(toggles.length).toBe(2);
    expect(toggles[0].textContent).toContain('Option A');
    expect(toggles[1].textContent).toContain('Option B');
  });

  it('should set the form control value to the index of the clicked option', () => {
    const toggleButtons: NodeListOf<HTMLButtonElement> = fixture.nativeElement
      .querySelectorAll('mat-button-toggle button');
    toggleButtons[1].click();
    fixture.detectChanges();
    expect(component.elementFormControl.value).toBe(1);
  });

  it('should highlight the selected option with the selection color', () => {
    component.elementModel.styling.selectionColor = 'lime';
    component.elementModel.styling.backgroundColor = 'white';
    component.elementFormControl.setValue(0);
    fixture.detectChanges();
    const toggles: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('mat-button-toggle');
    expect(toggles[0].style.backgroundColor).toBe('lime');
    expect(toggles[1].style.backgroundColor).toBe('white');
  });

  it('should apply the strike class to options when strikeOtherOptions is set and a value is selected', () => {
    component.elementModel.strikeOtherOptions = true;
    fixture.detectChanges();
    let struckToggles = fixture.nativeElement.querySelectorAll('mat-button-toggle.strike-other-options');
    expect(struckToggles.length).toBe(0);

    component.elementFormControl.setValue(1);
    fixture.detectChanges();
    struckToggles = fixture.nativeElement.querySelectorAll('mat-button-toggle.strike-other-options');
    expect(struckToggles.length).toBe(2);
  });

  it('should render a dummy placeholder when there are no options', () => {
    component.elementModel = createToggleButtonElement({ options: [] });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('mat-button-toggle').length).toBe(0);
    expect(fixture.nativeElement.querySelector('.fx-row-center-center')).not.toBeNull();
  });

  it('should mark the form control as touched on focusout', () => {
    expect(component.elementFormControl.touched).toBe(false);
    const toggleGroup: HTMLElement = fixture.nativeElement.querySelector('mat-button-toggle-group');
    toggleGroup.dispatchEvent(new Event('focusout'));
    expect(component.elementFormControl.touched).toBe(true);
  });

  it('should disable the form control when the element is read-only', async () => {
    expect(component.elementFormControl.disabled).toBe(false);
    component.elementModel.readOnly = true;
    fixture.detectChanges();
    // IsDisabledDirective schedules a setTimeout through the fixture's NgZone,
    // which is outside the test ProxyZone — fakeAsync/tick cannot flush it.
    await fixture.whenStable();
    expect(component.elementFormControl.disabled).toBe(true);
  });

  describe('startsWithText', () => {
    it('should say yes when its first option begins with text', () => {
      expect(ToggleButtonComponent.startsWithText(createToggleButtonElement())).toBe(true);
    });

    it('should say no when its first option begins with a picture', () => {
      expect(ToggleButtonComponent.startsWithText(
        createToggleButtonElement({ options: [{ text: '<img src="picture.png"><p>A</p>' }] })
      )).toBe(false);
    });

    it('should say no without options, when it holds only an empty line in its middle', () => {
      expect(ToggleButtonComponent.startsWithText(createToggleButtonElement({ options: [] }))).toBe(false);
    });
  });

  /* An option is set to a line height of 100% by default, which the gap's own normal line height does
     not reach through, so what the rules do shows without one given to the host (#1619). */
  describe('in a gap', () => {
    beforeEach(() => {
      component.clozeContext = true;
      fixture.detectChanges();
    });

    const group = (): HTMLElement => fixture.nativeElement.querySelector('mat-button-toggle-group');
    const label = (): HTMLElement => fixture.nativeElement.querySelector('.mat-button-toggle-label-content');

    it('should mark the group as standing in a gap', () => {
      expect(group().classList).toContain('cloze-context');
    });

    /* On the option: the 1px border around it is the theme's, which the tests do not load. */
    it('should make an option at least one line of normal height', () => {
      expect(label().getBoundingClientRect().height).toBeCloseTo(normalLineOf(label()), 0);
    });

    it('should still let a larger line height make an option taller', () => {
      component.elementModel = createToggleButtonElement();
      component.elementModel.styling.lineHeight = 300;
      fixture.detectChanges();

      expect(label().getBoundingClientRect().height).toBeCloseTo(3 * parseFloat(getComputedStyle(label()).fontSize), 0);
    });

    /* The label dialog saves an option as a paragraph, and a strut in front of a paragraph is a line of
       its own: the option was two lines high. */
    it('should keep an option that is a paragraph one line high', () => {
      component.elementModel = createToggleButtonElement({
        options: [{ text: '<p style="margin-bottom: 0px; margin-top: 0">Option A</p>' }, { text: 'Option B' }]
      });
      fixture.detectChanges();

      expect(label().getBoundingClientRect().height).toBeCloseTo(normalLineOf(label()), 0);
    });

    it('should centre an option in a gap lower than its line', () => {
      (fixture.nativeElement as HTMLElement).style.height = '20px';
      fixture.detectChanges();
      const button = (fixture.nativeElement.querySelector('.mat-button-toggle-button') as HTMLElement)
        .getBoundingClientRect();
      const content = label().getBoundingClientRect();

      expect((content.top + content.bottom) / 2).toBeCloseTo((button.top + button.bottom) / 2, 0);
    });
  });
});
