import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CheckboxProperties } from 'common/models/elements/input-group-elements/checkbox';
import { FileService } from 'common/services/file.service';
import { Merged } from 'editor/src/app/components/properties-panel/models/merged-properties';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { UnitService } from 'editor/src/app/services/unit.service';

/**
 * The three controls that belong to the checkbox alone: an image in place of the text label, the
 * preset value and whether a checked box crosses its label out.
 *
 * Corresponds exactly to `CheckboxProperties`, so the property names are checked on both sides.
 * `imgSrc` here is the element's own image, not `PlayerProperties.imgSrc`.
 *
 * The three sat far apart in `element-model-properties`, but nothing the checkbox also renders sat
 * between them, so collecting them here leaves the rendered order untouched.
 */
@Component({
  selector: 'aspect-checkbox-properties',
  templateUrl: './checkbox-properties.component.html',
  styleUrls: ['./checkbox-properties.component.scss'],
  standalone: false
})
export class CheckboxPropertiesComponent {
  @Input() combinedProperties!: Merged<CheckboxProperties>;
  @Output() updateModel =
    new EventEmitter<{ property: keyof CheckboxProperties; value: string | boolean | null }>();

  constructor(public unitService: UnitService, public dialogService: DialogService) { }

  async changeImgSrc(): Promise<void> {
    const file = await FileService.getRawFile('image/*');
    const base64 = await FileService.readFileAsText(file, true);
    if (FileService.isResizable(file.type)) {
      this.dialogService.showImageResizeDialog(base64, {}).subscribe(async options => {
        if (options) {
          const imgSrc = await FileService.scaleImage(base64, options);
          this.updateModel.emit({ property: 'imgSrc', value: imgSrc });
        }
      });
    } else {
      this.updateModel.emit({ property: 'imgSrc', value: base64 });
    }
  }
}
