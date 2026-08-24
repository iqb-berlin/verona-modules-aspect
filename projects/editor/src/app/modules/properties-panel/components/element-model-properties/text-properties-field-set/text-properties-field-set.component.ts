import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { TextElement, TextProperties } from 'common/models/elements/text-group-elements/text';
import { Merged } from 'editor/src/app/modules/properties-panel/models/merged-properties';
import { UnitService } from 'editor/src/app/services/unit.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { DialogService } from 'editor/src/app/services/dialog.service';

@Component({
  selector: 'aspect-text-props',
  standalone: false,
  templateUrl: './text-properties-field-set.component.html',
  styleUrls: ['./text-properties-field-set.component.scss']
})
export class TextPropsComponent {
  markingPanelIDs: [string, string][];
  @Input() combinedProperties!: Merged<TextProperties>;
  /**
   * The marking colours are emitted by the child highlight component and pass through here. Since
   * `TextProperties` extends `HighlightableProperties`, those names are covered by this key union
   * too, so the pass-through needs no widening. This component's own writes go through `emitOwn()`.
   */
  @Output() updateModel =
    new EventEmitter<{
      property: keyof TextProperties;
      value: string | number | boolean | string[] | null,
      isInputValid?: boolean | null
    }>();

  /** Emit one of this component's own properties, with the name checked against the model. */
  emitOwn(property: keyof TextProperties, value: string | number | boolean | string[]): void {
    this.updateModel.emit({ property, value });
  }

  constructor(public unitService: UnitService,
              public dialogService: DialogService,
              public selectionService: SelectionService) {
    this.markingPanelIDs = this.unitService.unit.getAllElements('marking-panel')
      .map(element => [element.id, element.alias]);
  }

  showTextEditDialog(): void {
    const selectedElement = this.selectionService.getSelectedElements()[0];
    this.dialogService.showRichTextEditDialog(
      (selectedElement as TextElement).text,
      (selectedElement as TextElement).styling.fontSize
    ).subscribe((result: string) => {
      if (result) {
        this.emitOwn('text', result);
      }
    });
  }

  toggleConnectedMarkingPanels(markingPanels: string[]) {
    this.emitOwn('markingPanels', [...markingPanels]);
  }
}
