import { ElementRef, SimpleChange } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { InputBackgroundColorDirective } from './input-background-color.directive';

describe('InputBackgroundColorDirective', () => {
  let directive: InputBackgroundColorDirective;
  let outline: HTMLElement;
  let wrapper: HTMLElement;
  let formFieldFlex: HTMLElement;

  beforeEach(() => {
    // rebuild the relevant Material form field DOM without bootstrapping MatInput
    const host = document.createElement('div');
    outline = document.createElement('div');
    outline.classList.add('mdc-notched-outline');
    wrapper = document.createElement('div');
    wrapper.classList.add('mat-mdc-text-field-wrapper');
    formFieldFlex = document.createElement('div');
    formFieldFlex.classList.add('mat-form-field-flex');
    host.append(outline, wrapper, formFieldFlex);
    directive = new InputBackgroundColorDirective(new ElementRef(host));
    directive.backgroundColor = 'lime';
  });

  it('should color the notched outline for the outline appearance', fakeAsync(() => {
    directive.appearance = 'outline';
    directive.ngOnChanges({});
    tick();
    expect(outline.style.getPropertyValue('background-color')).toBe('lime');
    expect(outline.style.getPropertyValue('z-index')).toBe('-1');
    expect(wrapper.style.getPropertyValue('background-color')).toBe('');
  }));

  it('should color the text field wrapper for other appearances', fakeAsync(() => {
    directive.appearance = 'fill';
    directive.ngOnChanges({});
    tick();
    expect(wrapper.style.getPropertyValue('background-color')).toBe('lime');
    expect(wrapper.style.getPropertyValue('z-index')).toBe('-1');
    expect(outline.style.getPropertyValue('background-color')).toBe('');
  }));

  it('should clear the old filled background when the appearance changes', fakeAsync(() => {
    formFieldFlex.style.setProperty('background-color', 'lime');
    directive.appearance = 'outline';
    directive.ngOnChanges({ appearance: new SimpleChange('fill', 'outline', false) });
    expect(formFieldFlex.style.getPropertyValue('background-color')).toBe('');
    tick();
  }));

  it('should not clear the filled background on the first change', fakeAsync(() => {
    formFieldFlex.style.setProperty('background-color', 'lime');
    directive.appearance = 'outline';
    directive.ngOnChanges({ appearance: new SimpleChange(undefined, 'outline', true) });
    expect(formFieldFlex.style.getPropertyValue('background-color')).toBe('lime');
    tick();
  }));
});
