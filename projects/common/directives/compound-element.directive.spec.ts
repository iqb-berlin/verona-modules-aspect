import { ElementRef, QueryList } from '@angular/core';
import { UIElement } from 'common/models/elements/element';
import { CompoundElementComponent } from './compound-element.directive';
import { ElementComponent } from './element-component.directive';

/* The base class of the elements that contain other elements (cloze, likert, table). Its whole job
   is to hand its form-element children upwards once the view exists, so the unit can register them
   in the parent form. Both members it relies on are abstract, so the subclass supplies them. */
class TestCompoundElementComponent extends CompoundElementComponent {
  elementModel: UIElement = { id: 'compound_1' } as unknown as UIElement;
  compoundChildren: QueryList<ElementComponent> = new QueryList<ElementComponent>();
  children: ElementComponent[] = [];

  getFormElementChildrenComponents(): ElementComponent[] {
    return this.children;
  }
}

describe('CompoundElementComponent', () => {
  let component: TestCompoundElementComponent;
  let emitted: ElementComponent[][];

  const childComponent = (id: string): ElementComponent => (
    { elementModel: { id } } as unknown as ElementComponent
  );

  beforeEach(() => {
    component = new TestCompoundElementComponent(new ElementRef(document.createElement('div')));
    emitted = [];
    component.childrenAdded.subscribe(children => emitted.push(children));
  });

  it('should emit its form element children once the view exists', () => {
    component.children = [childComponent('child_1'), childComponent('child_2')];

    component.ngAfterViewInit();

    expect(emitted).toHaveLength(1);
    expect(emitted[0].map(child => child.elementModel.id)).toEqual(['child_1', 'child_2']);
  });

  /* Still emits for a compound without form element children - a cloze that holds nothing but text
     has none. The receiver has to cope with an empty list rather than with no event. */
  it('should emit an empty list when there are no form element children', () => {
    component.ngAfterViewInit();

    expect(emitted).toEqual([[]]);
  });

  it('should emit exactly what getFormElementChildrenComponents returns', () => {
    const children = [childComponent('child_1')];
    component.children = children;

    component.ngAfterViewInit();

    expect(emitted[0]).toBe(children);
  });
});
