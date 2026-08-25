import { Directive } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { TextFieldElement } from 'common/models/elements/text-field';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import { ElementGroupDirective } from './element-group.directive';

/* The directive is abstract, so it is tested through a minimal concrete subclass. */
@Directive()
class TestElementGroupDirective extends ElementGroupDirective {
  constructor(public unitStateService: UnitStateService) {
    super();
  }
}

describe('ElementGroupDirective', () => {
  let directive: TestElementGroupDirective;
  let unitStateService: SpyObj<UnitStateService>;
  let domElement: HTMLElement;

  const createElementComponent = (isRelevantForPresentationComplete: boolean): ElementComponent => {
    const elementModel = new TextFieldElement({ type: 'text-field', id: 'text-field_1' });
    elementModel.isRelevantForPresentationComplete = isRelevantForPresentationComplete;
    return { elementModel, domElement } as unknown as ElementComponent;
  };

  beforeEach(() => {
    unitStateService = createSpyObj<UnitStateService>(['registerElementCode']);
    directive = new TestElementGroupDirective(unitStateService);
    domElement = document.createElement('div');
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should register an element code together with its page index', () => {
    directive.registerAtUnitStateService(
      'text-field_1', 'alias_1', 'value', createElementComponent(true), 3
    );

    expect(unitStateService.registerElementCode)
      .toHaveBeenCalledWith('text-field_1', 'alias_1', 'value', domElement, 3);
  });

  it('should register an element code without page index when it is not relevant for presentation complete', () => {
    directive.registerAtUnitStateService(
      'text-field_1', 'alias_1', 'value', createElementComponent(false), 3
    );

    expect(unitStateService.registerElementCode)
      .toHaveBeenCalledWith('text-field_1', 'alias_1', 'value', domElement, null);
  });
});
