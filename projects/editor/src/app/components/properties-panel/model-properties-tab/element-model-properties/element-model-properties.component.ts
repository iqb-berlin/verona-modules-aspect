import {
  Component, EventEmitter,
  Input, OnDestroy, Output
} from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Subject, firstValueFrom } from 'rxjs';
import { UIElement } from 'common/models/elements/element';
import { FileService } from 'common/services/file.service';
import { UIElementValue } from 'common/models/ui-element-interfaces';
import { MATH_KEYBOARD_PRESETS } from 'common/models/input-element-interfaces';
import { CombinedProperties } from 'editor/src/app/components/properties-panel/element-properties-panel/element-properties-panel.component';
import {
  BUTTON_ACTIONS, TRIGGER_ACTIONS
} from 'editor/src/app/components/properties-panel/model-properties-tab/action-properties/action-properties.component';
import { ElementService } from 'editor/src/app/services/element.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { DialogService } from 'editor/src/app/services/dialog.service';

@Component({
  selector: 'aspect-element-model-properties-component',
  templateUrl: './element-model-properties.component.html',
  styleUrls: ['./element-model-properties.component.scss'],
  standalone: false
})
export class ElementModelPropertiesComponent implements OnDestroy {
  @Input() combinedProperties!: CombinedProperties;
  @Input() selectedElements: UIElement[] = [];
  @Output() updateModel = new EventEmitter<{
    property: string;
    value: UIElementValue
    isInputValid?: boolean | null
  }>();

  MATH_KEYBOARD_PRESETS = MATH_KEYBOARD_PRESETS;
  BUTTON_ACTIONS = BUTTON_ACTIONS;
  TRIGGER_ACTIONS = TRIGGER_ACTIONS;
  private ngUnsubscribe = new Subject<void>();

  constructor(public unitService: UnitService,
              public elementService: ElementService,
              public selectionService: SelectionService,
              public dialogService: DialogService) { }

  addListValue(property: string, value: string): void {
    this.updateModel.emit({
      property: property,
      value: [...(this.combinedProperties[property] as string[]), value]
    });
  }

  moveListValue(property: string, event: CdkDragDrop<string[]>): void {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    this.updateModel.emit({ property: property, value: event.container.data });
  }

  async editTextOption(property: string, optionIndex: number): Promise<void> {
    const oldOptions = this.selectionService.getSelectedElements()[0][property] as string[];
    await this.dialogService.showTextEditDialog(oldOptions[optionIndex])
      .subscribe((result: string) => {
        if (result) {
          oldOptions[optionIndex] = result;
          this.updateModel.emit({ property, value: oldOptions });
        }
      });
  }

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

  async changeMediaSrc(elementType: string) {
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

  toggleProperty(property: string, checked:boolean): void {
    if (!checked) {
      this.elementService.updateElementsDimensionsProperty(this.selectionService.getSelectedElements(), property, null);
    }
  }

  updateDimensionProperty(property: string, value: any): void {
    this.elementService.updateElementsDimensionsProperty(this.selectionService.getSelectedElements(), property, value);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
