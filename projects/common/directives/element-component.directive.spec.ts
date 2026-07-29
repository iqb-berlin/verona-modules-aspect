import { ElementRef } from '@angular/core';
import { AspectError } from 'common/classes/aspect-error';
import { UIElement } from 'common/models/elements/element';
import { ElementComponent } from './element-component.directive';

/* The base class of every element component. It is abstract and has no template, so a minimal
   subclass over a real DOM node is enough - `project` is decided by where that node sits, which is
   the one thing here that needs an actual document. */
class TestElementComponent extends ElementComponent {
  elementModel: UIElement = { id: 'element_1' } as unknown as UIElement;
}

describe('ElementComponent', () => {
  let host: HTMLElement;

  const componentOn = (node: HTMLElement): TestElementComponent => new TestElementComponent(
    new ElementRef(node)
  );

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
  });

  afterEach(() => {
    host.remove();
  });

  it('should expose the host node as its dom element', () => {
    expect(componentOn(host).domElement).toBe(host);
  });

  /* This is how the shared components tell the two apps apart: the player renders them inside
     <aspect-unit>, the editor does not. */
  it('should report the project as player when rendered inside a unit', () => {
    const unit = document.createElement('aspect-unit');
    unit.appendChild(host);
    document.body.appendChild(unit);
    const component = componentOn(host);

    component.ngAfterContentChecked();

    expect(component.project).toBe('player');
    unit.remove();
  });

  it('should report the project as editor when rendered outside a unit', () => {
    const component = componentOn(host);

    component.ngAfterContentChecked();

    expect(component.project).toBe('editor');
  });

  // closest() matches the node itself too, not only its ancestors.
  it('should report the project as player when the host is the unit itself', () => {
    const unit = document.createElement('aspect-unit');
    document.body.appendChild(unit);
    const component = componentOn(unit);

    component.ngAfterContentChecked();

    expect(component.project).toBe('player');
    unit.remove();
  });

  /* Re-evaluated on every content check, so a node that gets moved is not stuck with the project it
     was first rendered in. */
  it('should re-evaluate the project when the host moves into a unit', () => {
    const component = componentOn(host);
    component.ngAfterContentChecked();
    expect(component.project).toBe('editor');

    const unit = document.createElement('aspect-unit');
    document.body.appendChild(unit);
    unit.appendChild(host);
    component.ngAfterContentChecked();

    expect(component.project).toBe('player');
    unit.remove();
  });

  it('should throw an AspectError carrying code and message', () => {
    const component = componentOn(host);

    expect(() => component.throwError('MEDIA_TIMEOUT', 'Failed to load in time'))
      .toThrowError(AspectError);
    try {
      component.throwError('MEDIA_TIMEOUT', 'Failed to load in time');
      expect.unreachable('throwError did not throw');
    } catch (error) {
      expect((error as AspectError).code).toBe('MEDIA_TIMEOUT');
      expect((error as AspectError).message).toBe('Failed to load in time');
      expect((error as AspectError).name).toBe('AspectError');
    }
  });
});
