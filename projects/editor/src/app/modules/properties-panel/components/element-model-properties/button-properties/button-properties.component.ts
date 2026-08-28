import {
  Component, EventEmitter, Input, OnDestroy, Output
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TooltipPosition } from 'common/models/ui-element-interfaces';
import { ButtonProperties } from 'common/models/elements/button';
import { Merged } from 'editor/src/app/modules/properties-panel/models/merged-properties';
import { DialogService } from 'editor/src/app/services/dialog.service';

@Component({
  selector: 'aspect-button-properties',
  standalone: false,
  templateUrl: './button-properties.component.html',
  styleUrls: ['./button-properties.component.scss']
})
export class ButtonPropertiesComponent implements OnDestroy {
  @Input() combinedProperties!: Merged<ButtonProperties>;
  @Output() updateModel =
    new EventEmitter<{
      property: keyof ButtonProperties; value: string | number | boolean | null, isInputValid?: boolean | null
    }>();

  checked = false;

  private ngUnsubscribe = new Subject<void>();

  constructor(private dialogService: DialogService) { }

  async importImage(): Promise<void> {
    const file = await this.dialogService.importImage();
    if (file) {
      this.updateModel.emit({ property: 'imageSrc', value: file.content });
    }
  }

  removeImage(): void {
    this.updateModel.emit({ property: 'imageSrc', value: null });
  }

  /**
   * Sends the image that is already on the button through the compression dialog (#1378).
   *
   * A button rendered as a link has no image to compress, and `disabledInteractive` -- which is what
   * lets the disabled button keep its tooltip -- still delivers the click. The markup grays the
   * button out for it; without this line a unit that carries both `asLink` and an `imageSrc` would
   * open the dialog anyway and write a new image into an element that shows none.
   */
  async compressImage(): Promise<void> {
    if (this.combinedProperties.asLink) return;
    const compressed = await this.dialogService
      .compressEmbeddedImage(this.combinedProperties.imageSrc as string);
    if (compressed) this.updateModel.emit({ property: 'imageSrc', value: compressed });
  }

  editTooltip(): void {
    this.dialogService.showTooltipDialog(
      (this.combinedProperties.tooltipText as string) || undefined,
      this.combinedProperties.tooltipPosition as TooltipPosition
    )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(result => {
        if (result) {
          if (result.action === 'delete') {
            this.updateModel.emit({ property: 'tooltipText', value: '' });
          } else {
            this.updateModel.emit({ property: 'tooltipText', value: result.tooltipText });
            this.updateModel.emit({ property: 'tooltipPosition', value: result.tooltipPosition });
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
