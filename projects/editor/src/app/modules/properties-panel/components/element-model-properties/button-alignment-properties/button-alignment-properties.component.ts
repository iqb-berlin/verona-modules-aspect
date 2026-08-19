import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { VerticalButtonAlignmentProperties } from 'common/models/ui-element-interfaces';
import { Merged } from 'editor/src/app/modules/properties-panel/models/merged-properties';

/**
 * Where the control of an option sits vertically: on the first line of its label, or on the middle of
 * the whole label.
 *
 * Offered for the elements that share `VerticalButtonAlignmentProperties` -- radio group and checkbox.
 * The option table has the same property but edits it per row, in its own dialog.
 */
@Component({
  selector: 'aspect-button-alignment-properties',
  templateUrl: './button-alignment-properties.component.html',
  styleUrls: ['./button-alignment-properties.component.scss'],
  standalone: false
})
export class ButtonAlignmentPropertiesComponent {
  @Input() combinedProperties!: Merged<VerticalButtonAlignmentProperties>;
  @Output() updateModel =
    new EventEmitter<{ property: keyof VerticalButtonAlignmentProperties; value: string | null }>();

  /** Value and label together: the two options read nothing like their stored values. */
  readonly alignments: { value: 'auto' | 'center'; label: string }[] = [
    { value: 'auto', label: 'propertiesPanel.buttonAlignmentFirstLine' },
    { value: 'center', label: 'propertiesPanel.buttonAlignmentCentered' }
  ];
}
