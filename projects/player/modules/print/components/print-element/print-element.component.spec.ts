/* eslint-disable max-classes-per-file */
import { Component, Input, QueryList } from '@angular/core';
import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CompoundElementComponent } from 'common/directives/compound-element.directive';
import { ElementComponent } from 'common/directives/element-component.directive';
import { TextFieldElement } from 'common/models/elements/text-input-group-elements/text-field';
import { TextFieldSimpleElement } from 'common/models/elements/text-input-group-elements/text-field-simple';
import { ComponentRegistry } from 'common/utils/component-registry';
import { PrintElementComponent } from './print-element.component';

@Component({
  selector: 'aspect-element-stub',
  template: '<span class="element-stub"></span>',
  standalone: false
})
class ElementStubComponent extends ElementComponent {
  elementModel!: TextFieldElement;
}

@Component({
  selector: 'aspect-compound-element-stub',
  template: '<span class="compound-element-stub"></span>',
  standalone: false
})
class CompoundElementStubComponent extends CompoundElementComponent {
  compoundChildren = new QueryList<ElementComponent>();
  elementModel!: TextFieldSimpleElement;

  // eslint-disable-next-line class-methods-use-this
  getFormElementChildrenComponents(): ElementComponent[] {
    return [];
  }
}

@Component({
  selector: 'aspect-print-label',
  template: '',
  standalone: false
})
class MockPrintLabelComponent {
  @Input() elementComponent!: ElementComponent;
}

describe('PrintElementComponent', () => {
  let component: PrintElementComponent;
  let fixture: ComponentFixture<PrintElementComponent>;
  let elementModel: TextFieldElement;

  const createChild = (id: string): ElementComponent => ({
    domElement: document.createElement('div'),
    elementModel: new TextFieldElement({ type: 'text-field', id, alias: `${id}_alias` })
  } as unknown as ElementComponent);

  beforeEach(async () => {
    elementModel = new TextFieldElement({ type: 'text-field', id: 'text-field_1', alias: 'text-field_1' });
    vi.spyOn(ComponentRegistry, 'getComponent').mockReturnValue(ElementStubComponent);

    await TestBed.configureTestingModule({
      declarations: [
        PrintElementComponent,
        ElementStubComponent,
        CompoundElementStubComponent,
        MockPrintLabelComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PrintElementComponent);
    component = fixture.componentInstance;
    component.elementModel = elementModel;
    component.printMode = 'on';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should create the registered component for the element type', () => {
    fixture.detectChanges();

    expect(ComponentRegistry.getComponent).toHaveBeenCalledWith('text-field');
    expect(component.printElementComponent).toBeInstanceOf(ElementStubComponent);
    expect(component.printElementComponent.elementModel).toBe(elementModel);
    expect(fixture.debugElement.query(By.css('.element-stub'))).toBeTruthy();
  });

  it('should mark the wrapper with id and alias of the element', () => {
    fixture.detectChanges();
    const wrapper = fixture.nativeElement.querySelector('[data-element-id]');

    expect(wrapper.getAttribute('data-element-id')).toBe('text-field_1');
    expect(wrapper.getAttribute('data-element-alias')).toBe('text-field_1');
  });

  it('should not label the element without the print mode for ids', () => {
    fixture.detectChanges();

    expect(component.elementComponents).toEqual([]);
    expect(fixture.debugElement.query(By.directive(MockPrintLabelComponent))).toBeNull();
  });

  it('should label the element in the print mode for ids', () => {
    component.printMode = 'on-with-ids';

    fixture.detectChanges();

    expect(component.elementComponents).toEqual([component.printElementComponent]);
    expect(fixture.debugElement.queryAll(By.directive(MockPrintLabelComponent)).length).toBe(1);
  });

  it('should label the children of a compound element', fakeAsync(() => {
    vi.spyOn(ComponentRegistry, 'getComponent').mockReturnValue(CompoundElementStubComponent);
    component.elementModel = new TextFieldSimpleElement({
      type: 'text-field-simple', id: 'text-field-simple_1', alias: 'text-field-simple_1'
    });
    component.printMode = 'on-with-ids';
    fixture.detectChanges();
    const children = [createChild('child_1'), createChild('child_2')];

    (component.printElementComponent as CompoundElementComponent).childrenAdded.emit(children);
    tick();
    fixture.detectChanges();

    expect(component.elementComponents).toEqual([component.printElementComponent, ...children]);
    expect(children[0].domElement.getAttribute('data-element-id')).toBe('child_1');
    expect(children[0].domElement.getAttribute('data-element-alias')).toBe('child_1_alias');
    expect(fixture.debugElement.queryAll(By.directive(MockPrintLabelComponent)).length).toBe(3);
  }));
});
