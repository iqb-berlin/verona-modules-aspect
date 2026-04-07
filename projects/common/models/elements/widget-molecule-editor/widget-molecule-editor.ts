import { UIElement } from 'common/models/elements/element';
import {
  BasicStyles, BorderStyles, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import {
  AbstractIDService, UIElementProperties, UIElementType
} from 'common/interfaces';
import { InstantiationEror } from 'common/errors';
import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class WidgetMoleculeEditorElement extends UIElement implements WidgetMoleculeEditorProperties {
  type: UIElementType = 'widget-molecule-editor';
  bondingType: 'VALENCE' | 'ELECTRONS' = ELEMENT_DEFAULTS['widget-molecule-editor']
    .bondingType as 'VALENCE' | 'ELECTRONS';

  styling!: BasicStyles & BorderStyles;
  state: string | null = ELEMENT_DEFAULTS['widget-molecule-editor'].state as string | null;

  static title: string = 'Molekül-Editor';
  static icon: string = 'biotech';

  constructor(element?: Partial<WidgetMoleculeEditorProperties>, idService?: AbstractIDService) {
    super({ type: 'widget-molecule-editor', ...element }, idService);
    if (isWidgetMoleculeEditorProperties(element)) {
      this.bondingType = element.bondingType;
      this.styling = { ...element.styling };
      this.state = element.state;
    } else if (environment.strictInstantiation) {
      throw new InstantiationEror('Error at WidgetMoleculeEditor instantiation', element);
    }
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
