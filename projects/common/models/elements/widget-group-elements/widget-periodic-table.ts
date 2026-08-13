import { UIElement } from 'common/models/elements/element';
import {
  BasicStyles, BorderStyles, PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { AbstractIDService } from 'common/models/id-interfaces';
import { UIElementProperties, UIElementType } from 'common/models/ui-element-interfaces';
import { InstantiationEror } from 'common/classes/instantiation-error';
import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class WidgetPeriodicTableElement extends UIElement implements WidgetPeriodicTableProperties {
  type: UIElementType = 'widget-periodic-table';
  styling: BasicStyles & BorderStyles = {
    ...PropertyGroupGenerators.generateBasicStyleProps(ELEMENT_DEFAULTS['widget-periodic-table']),
    ...PropertyGroupGenerators.generateBorderStylingProps(ELEMENT_DEFAULTS['widget-periodic-table'])
  };

  showInfoOrder: boolean = ELEMENT_DEFAULTS['widget-periodic-table'].showInfoOrder;
  showInfoENeg: boolean = ELEMENT_DEFAULTS['widget-periodic-table'].showInfoENeg;
  showInfoAMass: boolean = ELEMENT_DEFAULTS['widget-periodic-table'].showInfoAMass;
  closeOnSelection: boolean = ELEMENT_DEFAULTS['widget-periodic-table'].closeOnSelection;
  maxNumberOfSelections: number = ELEMENT_DEFAULTS['widget-periodic-table'].maxNumberOfSelections;
  state: string | null = ELEMENT_DEFAULTS['widget-periodic-table'].state;

  static title: string = 'Periodensystem';
  static icon: string = 'grid_on';

  constructor(element?: Partial<WidgetPeriodicTableProperties>, idService?: AbstractIDService) {
    super({ type: 'widget-periodic-table', ...element }, idService);
    if (isWidgetPeriodicTableProperties(element)) {
      this.styling = PropertyGroupGenerators.mergeStyling(this.styling, element.styling);
      if (element.showInfoOrder !== undefined) this.showInfoOrder = element.showInfoOrder;
      if (element.showInfoENeg !== undefined) this.showInfoENeg = element.showInfoENeg;
      if (element.showInfoAMass !== undefined) this.showInfoAMass = element.showInfoAMass;
      if (element.closeOnSelection !== undefined) this.closeOnSelection = element.closeOnSelection;
      if (element.maxNumberOfSelections !== undefined) this.maxNumberOfSelections = element.maxNumberOfSelections;
      if (element.state !== undefined) this.state = element.state;
    } else if (environment.strictInstantiation) {
      throw new InstantiationEror('Error at WidgetPeriodicTable instantiation', element);
    }
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
  return blueprint.type === 'widget-periodic-table';
}
