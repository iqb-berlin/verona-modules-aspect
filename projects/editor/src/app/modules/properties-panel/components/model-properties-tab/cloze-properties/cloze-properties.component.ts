import { Component, Input } from '@angular/core';
import { ClozeProperties } from 'common/models/elements/compound-group-elements/cloze/cloze';
import { Merged } from 'editor/src/app/modules/properties-panel/models/merged-properties';
import { ElementService } from 'editor/src/app/services/element.service';

/**
 * The cloze's document, which is not edited in the panel at all: the panel only offers the button
 * that opens the editor for it. `document` is therefore read and never written here - the dialog
 * writes it through `ElementService.showDefaultEditDialog()`.
 */
@Component({
  selector: 'aspect-cloze-properties',
  templateUrl: './cloze-properties.component.html',
  styleUrls: ['./cloze-properties.component.scss'],
  standalone: false
})
export class ClozePropertiesComponent {
  @Input() combinedProperties!: Merged<Pick<ClozeProperties, 'document'>>;

  constructor(public elementService: ElementService) { }
}
