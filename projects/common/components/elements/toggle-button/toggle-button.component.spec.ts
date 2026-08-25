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
});
