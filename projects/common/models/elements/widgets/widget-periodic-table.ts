import { Type } from '@angular/core';
import { UIElement } from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import {
  BasicStyles, BorderStyles, PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import {
  AbstractIDService, UIElementProperties, UIElementType
} from 'common/interfaces';
import { InstantiationEror } from 'common/errors';
import { WidgetPeriodicTableComponent } from 'common/components/widgets/widget-periodic-table.component';

export class WidgetPeriodicTableElement extends UIElement implements WidgetPeriodicTableProperties {
  type: UIElementType = 'widget-periodic-table';
  styling: BasicStyles & BorderStyles;

  static title: string = 'Periodensystem';
  static icon: string = 'smart_button';

  constructor(element?: Partial<WidgetPeriodicTableProperties>, idService?: AbstractIDService) {
    super({ type: 'widget-periodic-table', ...element }, idService);
    if (isWidgetPeriodicTableProperties(element)) {
      this.styling = { ...element.styling };
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at WidgetPeriodicTable instantiation', element);
      }
      this.styling = {
        ...PropertyGroupGenerators.generateBasicStyleProps({
          backgroundColor: 'lightgrey',
          ...element?.styling
        }),
        ...PropertyGroupGenerators.generateBorderStylingProps(element?.styling)
      };
    }
  }

  getElementComponent(): Type<ElementComponent> {
    return WidgetPeriodicTableComponent;
  }
}

export interface WidgetPeriodicTableProperties extends UIElementProperties {
  styling: BasicStyles & BorderStyles;
}

function isWidgetPeriodicTableProperties(
  blueprint?: Partial<WidgetPeriodicTableProperties>): blueprint is WidgetPeriodicTableProperties {
  if (!blueprint) return false;
  return PropertyGroupValidators.isValidBasicStyles(blueprint.styling) &&
  PropertyGroupValidators.isValidBorderStyles(blueprint.styling);
}
