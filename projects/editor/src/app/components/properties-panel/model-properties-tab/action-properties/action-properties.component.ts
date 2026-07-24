import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { UIElement } from 'common/models/elements/element';
import { StateVariable } from 'common/models/state-variable';
import { UnitService } from 'editor/src/app/services/unit.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { TextElement } from 'common/models/elements/text-group-elements/text';

@Component({
  selector: 'aspect-action-properties',
  templateUrl: './action-properties.component.html',
  standalone: false
})

export class ActionPropertiesComponent {
  @Input() combinedProperties!: UIElement;
  @Input() actions!: string[];
  @Output() updateModel =
    new EventEmitter<{
      property: string; value: string | number | boolean | StateVariable | null, isInputValid?: boolean | null
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
