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
import {
  WidgetMoleculeEditorComponent
} from 'common/components/widget-molecule-editor/widget-molecule-editor.component';

export class WidgetMoleculeEditorElement extends UIElement implements WidgetMoleculeEditorProperties {
  type: UIElementType = 'widget-molecule-editor';
  bondingType: 'VALENCE' | 'ELECTRONS' = 'VALENCE';
  styling: BasicStyles & BorderStyles;
  state: string | null = null;

  static title: string = 'Molekül-Editor';
  static icon: string = 'biotech';

  constructor(element?: Partial<WidgetMoleculeEditorProperties>, idService?: AbstractIDService) {
    super({ type: 'widget-molecule-editor', ...element }, idService);
    if (isWidgetMoleculeEditorProperties(element)) {
      this.bondingType = element.bondingType;
      this.styling = { ...element.styling };
      this.state = element.state;
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at WidgetMoleculeEditor instantiation', element);
      }
      if (element?.bondingType !== undefined) this.bondingType = element.bondingType;
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
    return WidgetMoleculeEditorComponent;
  }
}

export interface WidgetMoleculeEditorProperties extends UIElementProperties {
  bondingType: 'VALENCE' | 'ELECTRONS';
  styling: BasicStyles & BorderStyles;
  state: string | null;
}

export function isWidgetMoleculeEditorProperties(
  blueprint?: Partial<WidgetMoleculeEditorProperties>): blueprint is WidgetMoleculeEditorProperties {
  if (!blueprint) return false;
  return blueprint.bondingType !== undefined &&
    blueprint.state !== undefined &&
    PropertyGroupValidators.isValidBasicStyles(blueprint.styling) &&
    PropertyGroupValidators.isValidBorderStyles(blueprint.styling);
}
