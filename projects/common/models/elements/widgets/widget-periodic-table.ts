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
  showInfoOrder: boolean = true;
  showInfoENeg: boolean = false;
  showInfoAMass: boolean = true;
  closeOnSelection: boolean = false;
  maxNumberOfSelections: number = 1;
  state: string | null = null;

  static title: string = 'Periodensystem';
  static icon: string = 'smart_button';

  constructor(element?: Partial<WidgetPeriodicTableProperties>, idService?: AbstractIDService) {
    super({ type: 'widget-periodic-table', ...element }, idService);
    if (isWidgetPeriodicTableProperties(element)) {
      this.styling = { ...element.styling };
      this.showInfoOrder = element.showInfoOrder;
      this.showInfoENeg = element.showInfoENeg;
      this.showInfoAMass = element.showInfoAMass;
      this.closeOnSelection = element.closeOnSelection;
      this.maxNumberOfSelections = element.maxNumberOfSelections;
      this.state = element.state;
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at WidgetPeriodicTable instantiation', element);
      }
      if (element?.showInfoOrder !== undefined) this.showInfoOrder = element.showInfoOrder;
      if (element?.showInfoENeg !== undefined) this.showInfoENeg = element.showInfoENeg;
      if (element?.showInfoAMass !== undefined) this.showInfoAMass = element.showInfoAMass;
      if (element?.closeOnSelection !== undefined) this.closeOnSelection = element.closeOnSelection;
      if (element?.maxNumberOfSelections !== undefined) this.maxNumberOfSelections = element.maxNumberOfSelections;
      if (element?.state !== undefined) this.state = element.state;
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
  showInfoOrder: boolean;
  showInfoENeg: boolean;
  showInfoAMass: boolean;
  closeOnSelection: boolean;
  maxNumberOfSelections: number;
  state: string | null;
}

function isWidgetPeriodicTableProperties(
  blueprint?: Partial<WidgetPeriodicTableProperties>): blueprint is WidgetPeriodicTableProperties {
  if (!blueprint) return false;
  return blueprint.showInfoOrder !== undefined &&
    blueprint.showInfoENeg !== undefined &&
    blueprint.showInfoAMass !== undefined &&
    blueprint.closeOnSelection !== undefined &&
    blueprint.maxNumberOfSelections !== undefined &&
    blueprint.state !== undefined &&
    PropertyGroupValidators.isValidBasicStyles(blueprint.styling) &&
    PropertyGroupValidators.isValidBorderStyles(blueprint.styling);
}
