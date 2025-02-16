// eslint-disable-next-line max-classes-per-file
import {
  Component, EventEmitter,
  Input, OnDestroy, Output, Pipe, PipeTransform
} from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Subject } from 'rxjs';
import { InputElement, isInputElement, UIElement } from 'common/models/elements/element';
import { FileService } from 'common/services/file.service';
import { UIElementValue } from 'common/interfaces';
import { CombinedProperties } from 'editor/src/app/components/properties-panel/element-properties-panel.component';
import { ElementService } from 'editor/src/app/services/unit-services/element.service';
import { UnitService } from '../../../services/unit-services/unit.service';
import { SelectionService } from '../../../services/selection.service';
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector: 'aspect-element-model-properties-component',
  templateUrl: './element-model-properties.component.html',
  styleUrls: ['./element-model-properties.component.css']
})
export class ElementModelPropertiesComponent implements OnDestroy {
  @Input() combinedProperties!: CombinedProperties;
  @Input() selectedElements: UIElement[] = [];
  @Output() updateModel = new EventEmitter<{
    property: string;
    value: UIElementValue
    isInputValid?: boolean | null
  }>();

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
    const image = await FileService.loadImage();
    this.updateModel.emit({ property: 'imgSrc', value: image.content });
  }

  async changeMediaSrc(elementType: string) {
    let media = { name: '', content: '' };
    switch (elementType) {
      case 'hotspot-image':
      case 'image':
        media = await FileService.loadImage();
        break;
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

@Pipe({
  name: 'isInputElement',
  standalone: true
})
export class IsInputElementPipe implements PipeTransform {
  transform(el: UIElement): el is InputElement {
    return isInputElement(el);
  }
}
