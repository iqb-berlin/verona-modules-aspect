import { ElementRef } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { UIElement } from 'common/models/elements/element';
import { FormElementComponent } from './form-element-component.directive';

/* Abstract and without a template, so a minimal subclass is enough. What is worth pinning down here
   is which of the two form controls a component ends up with: the one the parent form already holds
   for its id, or a fresh one seeded from the element's value. In the player the parent form always
   exists; in the editor it does not, and the element still has to be editable. */
class TestFormElementComponent extends FormElementComponent {
  elementModel: UIElement = { id: 'element_1', value: 'aus dem Modell' } as unknown as UIElement;
}

describe('FormElementComponent', () => {
  const createComponent = (): TestFormElementComponent => new TestFormElementComponent(
    new ElementRef(document.createElement('div'))
  );

  it('should take the control the parent form holds for the element id', () => {
    const component = createComponent();
    const existingControl = new UntypedFormControl('aus dem Formular');
    component.parentForm = new UntypedFormGroup({ element_1: existingControl });

    component.ngOnInit();

    expect(component.elementFormControl).toBe(existingControl);
    expect(component.elementFormControl.value).toBe('aus dem Formular');
  });

  it('should create a control from the element value when there is no parent form', () => {
    const component = createComponent();

    component.ngOnInit();

    expect(component.elementFormControl).toBeInstanceOf(UntypedFormControl);
    expect(component.elementFormControl.value).toBe('aus dem Modell');
  });

  /* Characterizes an edge the concrete components never hit: with a parent form that has no control
     under this id, the lookup yields undefined and no fallback control is created. setElementValue
     would then fail. Recorded, not endorsed. */
  it('should leave the control undefined when the parent form does not know the element', () => {
    const component = createComponent();
    component.parentForm = new UntypedFormGroup({ another_element: new UntypedFormControl('x') });

    component.ngOnInit();

    expect(component.elementFormControl).toBeUndefined();
  });

  it('should write a new value into the control', () => {
    const component = createComponent();
    component.ngOnInit();

    component.setElementValue('neuer Wert');

    expect(component.elementFormControl.value).toBe('neuer Wert');
  });

  /* The second parameter exists for subclasses that need it (a cloze child passes its index, for
     example); the base implementation ignores it. */
  it('should ignore the option parameter', () => {
    const component = createComponent();
    component.ngOnInit();

    component.setElementValue('neuer Wert', 3);

    expect(component.elementFormControl.value).toBe('neuer Wert');
  });

  it('should write through to the control the parent form owns', () => {
    const component = createComponent();
    const existingControl = new UntypedFormControl('alt');
    component.parentForm = new UntypedFormGroup({ element_1: existingControl });
    component.ngOnInit();

    component.setElementValue('neu');

    expect(existingControl.value).toBe('neu');
  });
});
