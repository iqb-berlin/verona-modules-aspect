import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FileService } from 'common/services/file.service';
import {
  MediaSourceProperties, UIElementProperties, UIElementType
} from 'common/models/ui-element-interfaces';
import { Merged } from 'editor/src/app/modules/properties-panel/models/merged-properties';
import { DialogService } from 'editor/src/app/services/dialog.service';

/**
 * What this component reads. `type` is not part of the media source: it decides which file dialog
 * to open, because the four media elements accept different formats.
 *
 * Geometry has `fileName` without `src` — that is why the two live on separate levels in the model
 * (`FileNameProperties`, and `MediaSourceProperties` extending it), and why each control here has
 * its own condition rather than one shared one.
 */
type PanelMediaSourceProperties = MediaSourceProperties & Pick<UIElementProperties, 'type'>;

@Component({
  selector: 'aspect-media-source-properties',
  templateUrl: './media-source-properties.component.html',
  styleUrls: ['./media-source-properties.component.scss'],
  standalone: false
})
export class MediaSourcePropertiesComponent {
  @Input() combinedProperties!: Merged<PanelMediaSourceProperties>;
  @Output() updateModel =
    new EventEmitter<{ property: keyof MediaSourceProperties; value: string }>();

  constructor(private dialogService: DialogService) { }

  async changeMediaSrc(elementType: UIElementType | null | undefined): Promise<void> {
    let media = { name: '', content: '' };
    switch (elementType) {
      case 'hotspot-image':
      case 'image': {
        const file = await FileService.getRawFile('image/*');
        const base64 = await FileService.readFileAsText(file, true);
        if (FileService.isResizable(file.type)) {
          const options = await firstValueFrom(this.dialogService.showImageResizeDialog(base64, {}));
          if (!options) return;
          media.content = await FileService.scaleImage(base64, options);
        } else {
          media.content = base64;
        }
        media.name = file.name;
        break;
      }
      case 'audio':
        media = await FileService.loadAudio();
        break;
      case 'video':
        media = await FileService.loadVideo();
        break;
      // no default
    }
    this.updateModel.emit({ property: 'src', value: media.content });
    this.updateModel.emit({ property: 'fileName', value: media.name });
  }
}
