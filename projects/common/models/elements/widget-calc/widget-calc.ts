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

export class WidgetCalcElement extends UIElement implements WidgetCalcProperties {
  type: UIElementType = 'widget-calc';
  styling: BasicStyles & BorderStyles = {
    ...PropertyGroupGenerators.generateBasicStyleProps(ELEMENT_DEFAULTS['widget-calc']),
    ...PropertyGroupGenerators.generateBorderStylingProps(ELEMENT_DEFAULTS['widget-calc'])
  };

  mode: 'SIMPLE' | 'SCIENTIFIC' = ELEMENT_DEFAULTS['widget-calc'].mode as 'SIMPLE' | 'SCIENTIFIC';
  journalLines: number = ELEMENT_DEFAULTS['widget-calc'].journalLines as number;
  state: string | null = ELEMENT_DEFAULTS['widget-calc'].state as string | null;

  static title: string = 'Rechner';
  static icon: string = 'calculate';

  constructor(element?: Partial<WidgetCalcProperties>, idService?: AbstractIDService) {
    super({ type: 'widget-calc', ...element }, idService);
    if (isWidgetCalcProperties(element)) {
      this.styling = { ...element.styling };
      this.mode = element.mode;
      this.journalLines = element.journalLines;
      this.state = element.state;
    } else if (environment.strictInstantiation) {
      throw new InstantiationEror('Error at WidgetCalc instantiation', element);
    }
  }
}

export interface WidgetCalcProperties extends UIElementProperties {
  styling: BasicStyles & BorderStyles;
  mode: 'SIMPLE' | 'SCIENTIFIC';
  journalLines: number;
  state: string | null;
}

function isWidgetCalcProperties(
  blueprint?: Partial<WidgetCalcProperties>): blueprint is WidgetCalcProperties {
  if (!blueprint) return false;
  return blueprint.mode !== undefined &&
    blueprint.journalLines !== undefined &&
    blueprint.state !== undefined &&
    PropertyGroupValidators.isValidBasicStyles(blueprint.styling) &&
    PropertyGroupValidators.isValidBorderStyles(blueprint.styling);
}
