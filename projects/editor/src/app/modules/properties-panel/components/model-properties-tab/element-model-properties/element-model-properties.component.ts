import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { UIElement } from 'common/models/elements/element';
import { ClozeProperties } from 'common/models/elements/compound-group-elements/cloze/cloze';
import { DimensionProperties } from 'common/models/elements/property-group-interfaces';
import { ImageProperties } from 'common/models/elements/interactive-group-elements/image';
import { LikertProperties } from 'common/models/elements/compound-group-elements/likert/likert';
import { RadioButtonGroupProperties } from 'common/models/elements/input-group-elements/radio-button-group';
import { TextAreaProperties } from 'common/models/elements/text-input-group-elements/text-area';
import { ToggleButtonProperties } from 'common/models/elements/compound-group-elements/toggle-button';
import { UIElementProperties, UIElementValue } from 'common/models/ui-element-interfaces';
import { Merged } from 'editor/src/app/components/properties-panel/models/merged-properties';
import {
  BUTTON_ACTIONS, PanelActionProperties, TRIGGER_ACTIONS
} from 'editor/src/app/components/properties-panel/model-properties-tab/action-properties/action-properties.component';
import { ElementService } from 'editor/src/app/services/element.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import { SelectionService } from 'editor/src/app/services/selection.service';

/**
 * What is left of the panel's grab bag, as a type.
 *
 * This component corresponds to no model level and never will: it holds the properties every
 * element has, plus the ones that belong to a single element type and are not worth a component of
 * their own. Composing it with `Pick` from each owning interface is what makes it typeable anyway —
 * no interface is invented, and each line records which element type a property belongs to. Rename
 * a field in the model and the line here stops compiling.
 *
 * `action` is read only, to decide whether the action component is offered at all.
 */
export type PanelElementModelProperties =
  Pick<UIElementProperties, 'type' | 'alias' | 'isRelevantForPresentationComplete' | 'dimensions' | 'player'> &
  Pick<PanelActionProperties, 'action'> &
  Pick<LikertProperties, 'label' | 'label2'> &
  Pick<RadioButtonGroupProperties, 'alignment'> &
  Pick<ImageProperties, 'alt'> &
  Pick<ClozeProperties, 'document'> &
  Pick<TextAreaProperties, 'resizeEnabled'> &
  Pick<ToggleButtonProperties, 'verticalOrientation'>;

@Component({
  selector: 'aspect-element-model-properties-component',
  templateUrl: './element-model-properties.component.html',
  styleUrls: ['./element-model-properties.component.scss'],
  standalone: false
})
export class ElementModelPropertiesComponent {
  @Input() combinedProperties!: Merged<PanelElementModelProperties>;
  @Input() selectedElements: UIElement[] = [];
  /**
   * Deliberately `string`, unlike the leaf components: this channel also carries the events of the
   * fourteen child components, which emit the property names of *their* interfaces. Narrowing it
   * would mean listing every child's keys here and coupling the grab bag to all of them.
   *
   * The grab bag's own writes go through `emitOwn()` instead, which is checked. In the template
   * that also makes the difference visible: `emitOwn(...)` is a property of this component,
   * `updateModel.emit($event)` is a child's event passing through.
   */
  @Output() updateModel = new EventEmitter<{
    property: string;
    value: UIElementValue
    isInputValid?: boolean | null
  }>();

  BUTTON_ACTIONS = BUTTON_ACTIONS;
  TRIGGER_ACTIONS = TRIGGER_ACTIONS;

  constructor(public unitService: UnitService,
              public elementService: ElementService,
              public selectionService: SelectionService) { }

  /** Emit one of this component's own properties, with the name checked against the model. */
  emitOwn(property: keyof PanelElementModelProperties, value: UIElementValue): void {
    this.updateModel.emit({ property, value });
  }

  toggleProperty(property: keyof DimensionProperties, checked: boolean): void {
    if (!checked) {
      this.elementService.updateElementsDimensionsProperty(this.selectionService.getSelectedElements(), property, null);
    }
  }

  updateDimensionProperty(property: keyof DimensionProperties, value: number | boolean | null): void {
    this.elementService.updateElementsDimensionsProperty(this.selectionService.getSelectedElements(), property, value);
  }
}
