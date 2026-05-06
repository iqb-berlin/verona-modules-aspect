import { UIElement } from 'common/models/elements/element';
import {
  BasicStyles, BorderStyles, PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import {
  AbstractIDService, UIElementProperties, UIElementType
} from 'common/interfaces';
import { InstantiationEror } from 'common/errors';
import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class WidgetPeriodicTableElement extends UIElement implements WidgetPeriodicTableProperties {
  type: UIElementType = 'widget-periodic-table';
  styling: BasicStyles & BorderStyles = {
    ...PropertyGroupGenerators.generateBasicStyleProps(ELEMENT_DEFAULTS['widget-periodic-table']),
    ...PropertyGroupGenerators.generateBorderStylingProps(ELEMENT_DEFAULTS['widget-periodic-table'])
  };

  showInfoOrder: boolean = ELEMENT_DEFAULTS['widget-periodic-table'].showInfoOrder as boolean;
  showInfoENeg: boolean = ELEMENT_DEFAULTS['widget-periodic-table'].showInfoENeg as boolean;
  showInfoAMass: boolean = ELEMENT_DEFAULTS['widget-periodic-table'].showInfoAMass as boolean;
  closeOnSelection: boolean = ELEMENT_DEFAULTS['widget-periodic-table'].closeOnSelection as boolean;
  maxNumberOfSelections: number = ELEMENT_DEFAULTS['widget-periodic-table'].maxNumberOfSelections as number;
  state: string | null = ELEMENT_DEFAULTS['widget-periodic-table'].state as string | null;

  static title: string = 'Periodensystem';
  static icon: string = 'grid_on';

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
  return blueprint.showInfoOrder !== undefined &&
    blueprint.showInfoENeg !== undefined &&
    blueprint.showInfoAMass !== undefined &&
    blueprint.closeOnSelection !== undefined &&
    blueprint.maxNumberOfSelections !== undefined &&
    blueprint.state !== undefined &&
    PropertyGroupValidators.isValidBasicStyles(blueprint.styling) &&
    PropertyGroupValidators.isValidBorderStyles(blueprint.styling);
}
