import {
  Component, EventEmitter, Input, OnChanges, Output, SimpleChanges
} from '@angular/core';
import { UIElement } from 'common/models/elements/element';
import { UIElementProperties, UIElementValue } from 'common/models/ui-element-interfaces';
import { Merged } from 'editor/src/app/modules/properties-panel/models/merged-properties';
import {
  PanelSection, panelSectionsOf
} from 'editor/src/app/modules/properties-panel/models/panel-sections';
import { ElementService } from 'editor/src/app/services/element.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import {
  BUTTON_ACTIONS, PanelActionProperties, TRIGGER_ACTIONS
} from '../action-properties/action-properties.component';

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
export type PanelUIElementProperties =
  Pick<UIElementProperties, 'type' | 'alias' | 'isRelevantForPresentationComplete' | 'player'> &
  Pick<PanelActionProperties, 'action'>;

@Component({
  selector: 'aspect-ui-element-properties',
  templateUrl: './ui-element-properties.component.html',
  styleUrls: ['./ui-element-properties.component.scss'],
  standalone: false
})
export class UIElementPropertiesComponent implements OnChanges {
  @Input() combinedProperties!: Merged<PanelUIElementProperties>;
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

  /**
   * Which sections the current selection has, from `PANEL_SECTIONS`. Kept as a field and
   * recomputed on change rather than derived in the template (rules.md §1).
   */
  show: Record<PanelSection, boolean> = panelSectionsOf([]);

  BUTTON_ACTIONS = BUTTON_ACTIONS;
  TRIGGER_ACTIONS = TRIGGER_ACTIONS;

  constructor(public unitService: UnitService,
              public elementService: ElementService) { }

  ngOnChanges(changes: SimpleChanges): void {
    // Only when the selection itself changed. `combinedProperties` is rebuilt on every keystroke in
    // any panel field, and recomputing here would hand the two children that read `show` a new
    // object identity each time, for a value that cannot have changed.
    if (changes.selectedElements) {
      this.show = panelSectionsOf(this.selectedElements);
    }
  }

  /** Emit one of this component's own properties, with the name checked against the model. */
  emitOwn(property: keyof PanelUIElementProperties, value: UIElementValue): void {
    this.updateModel.emit({ property, value });
  }
}
