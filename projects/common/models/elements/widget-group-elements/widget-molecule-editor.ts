import { UIElement } from 'common/models/elements/element';
import { PropertyGroupGenerators } from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { AbstractIDService } from 'common/models/id-interfaces';
import { UIElementProperties, UIElementType } from 'common/models/ui-element-interfaces';
import { InstantiationEror } from 'common/classes/instantiation-error';
import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class WidgetMoleculeEditorElement extends UIElement implements WidgetMoleculeEditorProperties {
  type: UIElementType = 'widget-molecule-editor';
  bondingType: 'VALENCE' | 'ELECTRONS' = ELEMENT_DEFAULTS['widget-molecule-editor'].bondingType;

  /* The button that opens the widget takes its two colours from here, and nothing else in this
     element renders a styling value -- what it shows besides the button is the stored molecule, as an
     image or as text. So the declaration says two keys, not eleven: font size, weight, slant,
     underline and the four border members offered controls that did nothing (#1230). */
  styling: { backgroundColor: string; fontColor: string } = {
    backgroundColor: ELEMENT_DEFAULTS['widget-molecule-editor'].backgroundColor,
    fontColor: ELEMENT_DEFAULTS['widget-molecule-editor'].fontColor
  };

  state: string | null = ELEMENT_DEFAULTS['widget-molecule-editor'].state;

  static title: string = 'Molekül-Editor';
  static icon: string = 'hub';

  constructor(element?: Partial<WidgetMoleculeEditorProperties>, idService?: AbstractIDService) {
    super({ type: 'widget-molecule-editor', ...element }, idService);
    if (isWidgetMoleculeEditorProperties(element)) {
      if (element.bondingType !== undefined) this.bondingType = element.bondingType;
      this.styling = PropertyGroupGenerators.mergeStyling(this.styling, element.styling);
      if (element.state !== undefined) this.state = element.state;
    } else if (environment.strictInstantiation) {
      throw new InstantiationEror('Error at WidgetMoleculeEditor instantiation', element);
    }
  }
}

export interface WidgetMoleculeEditorProperties extends UIElementProperties {
  bondingType: 'VALENCE' | 'ELECTRONS';
  styling: { backgroundColor: string; fontColor: string };
  state: string | null;
}

export function isWidgetMoleculeEditorProperties(
  blueprint?: Partial<WidgetMoleculeEditorProperties>): blueprint is WidgetMoleculeEditorProperties {
  if (!blueprint) return false;
  return blueprint.type === 'widget-molecule-editor';
}
