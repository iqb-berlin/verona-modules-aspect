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
import { WidgetCalcComponent } from 'common/components/widget-calc/widget-calc.component';

export class WidgetCalcElement extends UIElement implements WidgetCalcProperties {
  type: UIElementType = 'widget-calc';
  styling: BasicStyles & BorderStyles;
  mode: 'SIMPLE' | 'SCIENTIFIC' = 'SIMPLE';
  journalLines: number = 0;
  state: string | null = null;

  static title: string = 'Taschenrechner';
  static icon: string = 'calculate';

  constructor(element?: Partial<WidgetCalcProperties>, idService?: AbstractIDService) {
    super({ type: 'widget-calc', ...element }, idService);
    if (isWidgetCalcProperties(element)) {
      this.styling = { ...element.styling };
      this.mode = element.mode;
      this.journalLines = element.journalLines;
      this.state = element.state;
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at WidgetCalc instantiation', element);
      }
      if (element?.mode !== undefined) this.mode = element.mode;
      if (element?.journalLines !== undefined) this.journalLines = element.journalLines;
      if (element?.state !== undefined) this.state = element.state;
      this.styling = {
        ...PropertyGroupGenerators.generateBasicStyleProps({
          ...element?.styling
        }),
        ...PropertyGroupGenerators.generateBorderStylingProps(element?.styling)
      };
    }
  }

  getElementComponent(): Type<ElementComponent> {
    return WidgetCalcComponent;
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
