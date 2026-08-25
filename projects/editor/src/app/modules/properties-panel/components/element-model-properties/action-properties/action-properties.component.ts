import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ButtonAction, UnitNavParam } from 'common/models/elements/button';
import { TriggerAction } from 'common/models/elements/trigger';
import { StateVariable } from 'common/models/state-variable';
import { ActionProperties } from 'common/models/ui-element-interfaces';
import { Merged } from 'editor/src/app/modules/properties-panel/models/merged-properties';
import { UnitService } from 'editor/src/app/services/unit.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { TextElement } from 'common/models/elements/text';

/**
 * The panel's view of an element with an action.
 *
 * A selection can hold buttons and triggers at the same time, so both vocabularies are allowed
 * here even though no single element type accepts all of them. Which ones are actually offered
 * is decided by the `actions` input.
 */
export type PanelActionProperties =
  ActionProperties<ButtonAction | TriggerAction, UnitNavParam | number | string | StateVariable>;

/** Offered for a button; order is the order of the options in the select. */
export const BUTTON_ACTIONS: readonly ButtonAction[] =
  ['unitNav', 'pageNav', 'highlightText', 'stateVariableChange'];

/** Offered for a trigger; order is the order of the options in the select. */
export const TRIGGER_ACTIONS: readonly TriggerAction[] =
  ['highlightText', 'removeHighlights', 'stateVariableChange'];

@Component({
  selector: 'aspect-action-properties',
  templateUrl: './action-properties.component.html',
  standalone: false
})

export class ActionPropertiesComponent {
  @Input() combinedProperties!: Merged<PanelActionProperties>;
  @Input() actions!: readonly (ButtonAction | TriggerAction)[];
  @Output() updateModel =
    new EventEmitter<{
      property: keyof PanelActionProperties;
      value: string | number | boolean | StateVariable | null,
      isInputValid?: boolean | null
    }>();

  resetActionParam(): void {
    this.updateModel.emit({ property: 'actionParam', value: null });
  }

  anchorIds: string[] = [];

  constructor(public unitService: UnitService, public selectionService: SelectionService) {
    this.anchorIds = (unitService.unit.getAllElements('text') as TextElement[])
      .flatMap(textElement => textElement.getAnchorIDs());
  }
}
