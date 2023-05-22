import {
  Component, EventEmitter,
  Input, Output
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import {
  InputElementValue, TextLabel, TextImageLabel, UIElement, Hotspot
} from 'common/models/elements/element';
import { LikertRowElement } from 'common/models/elements/compound-elements/likert/likert-row';
import { FileService } from 'common/services/file.service';
import { CombinedProperties } from 'editor/src/app/components/properties-panel/element-properties-panel.component';
import { firstValueFrom } from 'rxjs';
import { UnitService } from '../../../services/unit.service';
import { SelectionService } from '../../../services/selection.service';
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector: 'aspect-element-model-properties-component',
  templateUrl: './element-model-properties.component.html',
  styleUrls: ['./element-model-properties.component.css']
})
export class ElementModelPropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Input() selectedElements: UIElement[] = [];
  @Output() updateModel = new EventEmitter<{
    property: string;
    value: InputElementValue | TextImageLabel[] | LikertRowElement[] | TextLabel[] | Hotspot[]
    isInputValid?: boolean | null
  }>();

  constructor(public unitService: UnitService,
              public selectionService: SelectionService,
              public dialogService: DialogService,
              public sanitizer: DomSanitizer) { }

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

  async changeMediaSrc(elementType: string) {
    let mediaSrc = '';
    switch (elementType) {
      case 'hotspot-image':
      case 'image':
        mediaSrc = await FileService.loadImage();
        break;
      case 'audio':
        mediaSrc = await FileService.loadAudio();
        break;
      case 'video':
        mediaSrc = await FileService.loadVideo();
        break;
      // no default
    }
    this.updateModel.emit({ property: 'src', value: mediaSrc });
  }

  async showGeogebraAppDefDialog() {
    const appDefinition = await firstValueFrom(this.dialogService.showGeogebraAppDefinitionDialog());
    if (appDefinition) this.updateModel.emit({ property: 'appDefinition', value: appDefinition });
  }
}
