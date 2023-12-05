import {
  ChangeDetectorRef,
  Component, ComponentRef, EventEmitter,
  Input, OnDestroy, OnInit, Output
} from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { InputElementValue, UIElement } from 'common/models/elements/element';
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
import { UnitService } from '../../../services/unit.service';
import { SelectionService } from '../../../services/selection.service';
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector: 'aspect-element-model-properties-component',
  templateUrl: './element-model-properties.component.html',
  styleUrls: ['./element-model-properties.component.css']
})
export class ElementModelPropertiesComponent implements OnInit, OnDestroy {
  @Input() combinedProperties!: CombinedProperties;
  @Input() selectedElements: UIElement[] = [];
  @Output() updateModel = new EventEmitter<{
    property: string;
    value: InputElementValue | TextImageLabel[] | LikertRowElement[] | TextLabel[] | Hotspot[] | StateVariable
    isInputValid?: boolean | null
  }>();

  geometryObjects: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  private ngUnsubscribe = new Subject<void>();

  constructor(public unitService: UnitService,
              public selectionService: SelectionService,
              public dialogService: DialogService,
              private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.initGeometryListener();
  }

  initGeometryListener(): void {
    this.selectionService.selectedElements.pipe(
      switchMap((selectedElements: UIElement[]) => {
        if (selectedElements.length !== 1 ||
          selectedElements[0].type !== 'geometry') {
          return of(false);
        }
        return (this.selectionService.selectedElementComponents[0].childComponent as ComponentRef<GeometryComponent>)
          .instance.isLoaded
          .pipe(takeUntil(this.ngUnsubscribe));
      }))
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((isLoaded: boolean) => {
        if (!isLoaded) return;
        this.geometryObjects.next(
          (this.selectionService.selectedElementComponents[0].childComponent as ComponentRef<GeometryComponent>)
            .instance.getGeometryObjects());
      });
  }

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

  setGeometryVariables(variables: string[]) {
    this.updateModel.emit({
      property: 'trackedVariables',
      value: variables
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
