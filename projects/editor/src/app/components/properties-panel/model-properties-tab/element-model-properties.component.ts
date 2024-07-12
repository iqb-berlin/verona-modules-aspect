// eslint-disable-next-line max-classes-per-file
import {
  Component, ComponentRef, EventEmitter,
  Input, OnDestroy, OnInit, Output, Pipe, PipeTransform
} from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  InputElement, InputElementValue, isInputElement, UIElement, UIElementValue
} from 'common/models/elements/element';
import { LikertRowElement } from 'common/models/elements/compound-elements/likert/likert-row';
import { FileService } from 'common/services/file.service';
import { CombinedProperties } from 'editor/src/app/components/properties-panel/element-properties-panel.component';
import {
  BehaviorSubject, firstValueFrom, of, Subject, switchMap
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TextImageLabel, TextLabel } from 'common/models/elements/label-interfaces';
import { Hotspot } from 'common/models/elements/input-elements/hotspot-image';
import { StateVariable } from 'common/models/state-variable';
import { GeometryComponent } from 'common/components/geometry/geometry.component';
import { UnitService } from '../../../services/unit-services/unit.service';
import { SelectionService } from '../../../services/selection.service';
import { DialogService } from '../../../services/dialog.service';
import { ElementService } from 'editor/src/app/services/unit-services/element.service';

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
    // value: InputElementValue | TextImageLabel[] | LikertRowElement[] | TextLabel[] | Hotspot[] | StateVariable
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
