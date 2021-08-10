import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import {
  Unit, UnitPage, UnitPageSection, UnitUIElement
} from '../../../common/unit';
import { FileService } from '../../../common/file.service';
import * as UnitFactory from './model/UnitFactory';
import { MessageService } from '../../../common/message.service';
import { IdService } from './id.service';
import { DialogService } from './dialog.service';
// eslint-disable-next-line import/no-cycle
import { CanvasElementOverlay } from './components/unit-view/page-view/canvas/canvas-element-overlay';
// eslint-disable-next-line import/no-cycle
import { CanvasSectionComponent } from './components/unit-view/page-view/canvas/canvas-section.component';

@Injectable({
  providedIn: 'root'
})
export class UnitService {
  private _unit: BehaviorSubject<Unit>;
  private _selectedPage: BehaviorSubject<UnitPage>;
  private _selectedPageSection: BehaviorSubject<UnitPageSection>;
  private selectedPageSectionComponent!: CanvasSectionComponent;
  private _selectedPageIndex: BehaviorSubject<number>; // TODO weg refactorn

  elementPropertyUpdated: Subject<void> = new Subject<void>();

  selectedComponentElements: CanvasElementOverlay[] = [];
  elementSelected: Subject<UnitUIElement[]> = new Subject<UnitUIElement[]>();

  constructor(private messageService: MessageService,
              private idService: IdService,
              private dialogService: DialogService) {
    const initialUnit = UnitFactory.createUnit();
    const initialPage = UnitFactory.createUnitPage(0);
    const initialSection = UnitFactory.createUnitPageSection();
    initialPage.sections.push(initialSection);
    initialUnit.pages.push(initialPage);

    this._unit = new BehaviorSubject(initialUnit);
    this._selectedPageIndex = new BehaviorSubject(0);
    this._selectedPage = new BehaviorSubject(initialPage);
    this._selectedPageSection = new BehaviorSubject(initialPage.sections[0]);
  }

  // == SELECTION ===============================
  selectElement(event: { componentElement: CanvasElementOverlay; multiSelect: boolean }): void {
    if (!event.multiSelect) {
      this.clearSelection();
    }
    this.selectedComponentElements.push(event.componentElement);
    event.componentElement.setSelected(true); // TODO direkt in der component?
    this.elementSelected.next(this.selectedComponentElements.map(componentElement => componentElement.element));
  }

  get selectedElements(): UnitUIElement[] {
    return this.selectedComponentElements.map(componentElement => componentElement.element);
  }

  private clearSelection() {
    this.selectedComponentElements.forEach((overlayComponent: CanvasElementOverlay) => {
      overlayComponent.setSelected(false);
    });
    this.selectedComponentElements = [];
  }

  selectSection(sectionComponent: CanvasSectionComponent): void {
    if (this.selectedPageSectionComponent) {
      this.selectedPageSectionComponent.selected = false;
    }
    this.selectedPageSectionComponent = sectionComponent;
    this.selectedPageSectionComponent.selected = true;
    this._selectedPageSection.next(sectionComponent.section);
  }
  // ===========================================

  get unit(): Observable<Unit> {
    return this._unit.asObservable();
  }

  get selectedPage(): Observable<UnitPage> {
    return this._selectedPage.asObservable();
  }

  get selectedPageSection(): Observable<UnitPageSection> {
    return this._selectedPageSection.asObservable();
  }

  get selectedPageIndex(): Observable<number> {
    return this._selectedPageIndex.asObservable();
  }

  addPage(): void {
    const newPage = UnitFactory.createUnitPage(this._unit.value.pages.length);
    newPage.sections.push(UnitFactory.createUnitPageSection());
    this._unit.value.pages.push(newPage);

    this._unit.next(this._unit.value);
    this._selectedPageIndex.next(this._unit.value.pages.length - 1);
    this._selectedPage.next(this._unit.value.pages[this._unit.value.pages.length - 1]);
  }

  deletePage(index: number = this._selectedPageIndex.value): void {
    this._unit.value.pages.splice(index, 1);
    this._unit.next(this._unit.value);
    if (index === this._selectedPageIndex.value) {
      this._selectedPageIndex.next(this._selectedPageIndex.value - 1);
    }
  }

  /** Checks if a page already has this setting. Return false if so.
   * When newState is false it is always okay. */
  setPageAlwaysVisible(newState: boolean): boolean {
    if (!newState || !this._unit.value.pages.find(page => page.alwaysVisible)) {
      this._unit.value.pages[this._selectedPageIndex.value].alwaysVisible = newState;
      return true;
    }
    this.messageService.showError('Kann nur für eine Seite gesetzt werden');
    return false;
  }

  addSection(): void {
    this._unit.value.pages[this._selectedPageIndex.value].sections.push(UnitFactory.createUnitPageSection());
    this._unit.next(this._unit.value);
  }

  deleteSelectedSection(): void {
    if (this._unit.value.pages[this._selectedPageIndex.value].sections.length < 2) {
      this.messageService.showWarning('cant delete last section');
    } else {
      this._unit.value.pages[this._selectedPageIndex.value].sections.splice(
        this._unit.value.pages[this._selectedPageIndex.value].sections.indexOf(this._selectedPageSection.value), 1
      );
      this._unit.next(this._unit.value);
    }
  }

  moveSection(sectionIndex: number, direction: 'up' | 'down'): void {
    const movedElement = this._unit.value.pages[this._selectedPageIndex.value].sections[sectionIndex];
    this._unit.value.pages[this._selectedPageIndex.value].sections.splice(sectionIndex, 1);
    if (direction === 'up') {
      this._unit.value.pages[this._selectedPageIndex.value].sections.splice(sectionIndex - 1, 0, movedElement);
    } else {
      this._unit.value.pages[this._selectedPageIndex.value].sections.splice(sectionIndex + 1, 0, movedElement);
    }
  }

  async addElement(elementType: string): Promise<void> {
    let newElement: UnitUIElement;
    switch (elementType) {
      case 'text':
        newElement = UnitFactory.createTextElement();
        break;
      case 'button':
        newElement = UnitFactory.createButtonElement();
        break;
      case 'text-field':
        newElement = UnitFactory.createTextfieldElement();
        break;
      case 'number-field':
        newElement = UnitFactory.createNumberfieldElement();
        break;
      case 'text-area':
        newElement = UnitFactory.createTextareaElement();
        break;
      case 'checkbox':
        newElement = UnitFactory.createCheckboxElement();
        break;
      case 'dropdown':
        newElement = UnitFactory.createDropdownElement();
        break;
      case 'radio':
        newElement = UnitFactory.createRadioButtonGroupElement();
        break;
      case 'image':
        newElement = UnitFactory.createImageElement(await FileService.loadImage());
        break;
      case 'audio':
        newElement = UnitFactory.createAudioElement(await FileService.loadAudio());
        break;
      case 'video':
        newElement = UnitFactory.createVideoElement(await FileService.loadVideo());
        break;
      case 'correction':
        newElement = UnitFactory.createCorrectionElement();
        break;
      default:
        throw new Error(`ElementType ${elementType} not found!`);
    }
    newElement.id = this.idService.getNewID(elementType);
    newElement.dynamicPositioning = this._selectedPageSection.value.dynamicPositioning;
    this._selectedPageSection.value.elements.push(newElement);
  }

  deleteSelectedElements(): void {
    const selectedElements = this.selectedElements;
    this._selectedPageSection.value.elements =
      this._selectedPageSection.value.elements.filter(element => !selectedElements.includes(element));
  }

  duplicateSelectedElements(): void {
    const selectedElements = this.selectedComponentElements.map(componentElement => componentElement.element);
    selectedElements.forEach((element: UnitUIElement) => {
      const newElement: UnitUIElement = { ...element };
      newElement.id = this.idService.getNewID(newElement.type);
      newElement.xPosition += 10;
      newElement.yPosition += 10;
      this._selectedPageSection.value.elements.push(newElement);
    });
  }

  updatePageSelection(newIndex: number): void {
    this._selectedPageIndex.next(newIndex);
    this._selectedPage.next(this._unit.value.pages[newIndex]);
  }

  updateSelectedElementProperty(property: string, value: string | number | boolean | undefined): boolean {
    this.selectedElements.forEach((element: UnitUIElement) => {
    // for (const element of this.selectedElements) {
      if (['string', 'number', 'boolean', 'undefined'].indexOf(typeof element[property]) > -1) {
        if (property === 'id') {
          if (!this.idService.isIdAvailable((value as string))) { // prohibit existing IDs
            this.messageService.showError('ID ist bereits vergeben');
            return false;
          }
          this.idService.removeId(element[property]);
          this.idService.addId(<string>value);
        }
        element[property] = value;
      } else if (Array.isArray(element[property])) {
        (element[property] as string[]).push(value as string);
      } else {
        console.error('ElementProperty not found!', element[property]);
      }
      this.elementPropertyUpdated.next(); // notify properties panel/element about change
      return true;
    });
    return true;
  }

  alignSelectedElements(alignmentDirection: 'left' | 'right' | 'top' | 'bottom'): void {
    const elements = this.selectedComponentElements.map(componentElement => componentElement.element);
    let newValue: number;
    switch (alignmentDirection) {
      case 'left':
        newValue = Math.min(...elements.map(element => element.xPosition));
        elements.forEach((element: UnitUIElement) => {
          element.xPosition = newValue;
        });
        break;
      case 'right':
        newValue = Math.max(...elements.map(element => element.xPosition + element.width));
        elements.forEach((element: UnitUIElement) => {
          element.xPosition = newValue - element.width;
        });
        break;
      case 'top':
        newValue = Math.min(...elements.map(element => element.yPosition));
        elements.forEach((element: UnitUIElement) => {
          element.yPosition = newValue;
        });
        break;
      case 'bottom':
        newValue = Math.max(...elements.map(element => element.yPosition + element.height));
        elements.forEach((element: UnitUIElement) => {
          element.yPosition = newValue - element.height;
        });
        break;
      // no default
    }
    this.elementPropertyUpdated.next();
  }

  setSectionDynamicPositioning(value: boolean): void {
    const section = this._selectedPageSection.value;
    section.dynamicPositioning = value;
    section.elements.forEach((element: UnitUIElement) => {
      element.dynamicPositioning = value;
    });
    if (this.selectedComponentElements.length > 0) {
      this.elementPropertyUpdated.next();
    }
  }

  saveUnit(): void {
    const unitJSON = JSON.stringify(this._unit.value);
    FileService.saveUnitToFile(unitJSON);
  }

  async loadUnit(): Promise<void> {
    const newUnit = JSON.parse(await FileService.loadFile(['.json']));
    this._selectedPageIndex.next(0);
    this._selectedPage.next(this._unit.value.pages[0]);
    this._unit.next(newUnit);
    this.idService.readExistingIDs(this._unit.value);
  }

  showDefaultEditDialog(element: UnitUIElement): void {
    switch (element.type) {
      case 'button':
      case 'checkbox':
      case 'dropdown':
      case 'radio':
        this.dialogService.showTextEditDialog((element as any).label, false).subscribe((result: string) => {
          if (result) {
            this.updateSelectedElementProperty('label', result);
          }
        });
        break;
      case 'text':
        this.dialogService.showTextEditDialog((element as any).text, true).subscribe((result: string) => {
          if (result) {
            this.updateSelectedElementProperty('text', result);
          }
        });
        break;
      case 'text-field':
        this.dialogService.showTextEditDialog((element as any).value).subscribe((result: string) => {
          if (result) {
            this.updateSelectedElementProperty('value', result);
          }
        });
        break;
      case 'text-area':
        this.dialogService.showTextEditDialog((element as any).value, true).subscribe((result: string) => {
          if (result) {
            this.updateSelectedElementProperty('value', result);
          }
        });
      // no default
    }
  }
}
