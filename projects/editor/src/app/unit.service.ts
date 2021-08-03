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

@Injectable({
  providedIn: 'root'
})
export class UnitService {
  private _unit: BehaviorSubject<Unit>;
  private _selectedPage: BehaviorSubject<UnitPage>;
  private _selectedPageSection: BehaviorSubject<UnitPageSection>;
  private _selectedPageIndex: BehaviorSubject<number>; // TODO weg refactorn
  private _pages: BehaviorSubject<UnitPage>[];

  private _selectedPageSectionIndex: BehaviorSubject<number>;

  elementPropertyUpdated: Subject<void> = new Subject<void>();

  constructor(private messageService: MessageService,
              private idService: IdService,
              private dialogService: DialogService) {
    const initialUnit = UnitFactory.createUnit();
    const initialPage = UnitFactory.createUnitPage(0);
    const initialSection = UnitFactory.createUnitPageSection();
    initialPage.sections.push(initialSection);
    initialUnit.pages.push(initialPage);

    this._unit = new BehaviorSubject(initialUnit);
    this._pages = [new BehaviorSubject(initialPage as UnitPage)];
    this._selectedPageIndex = new BehaviorSubject(0);
    this._selectedPage = new BehaviorSubject(initialPage);
    this._selectedPageSection = new BehaviorSubject(initialPage.sections[0]);

    this._selectedPageSectionIndex = new BehaviorSubject<number>(0);
  }

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

  get selectedPageSectionIndex(): Observable<number> {
    return this._selectedPageSectionIndex.asObservable();
  }

  getSelectedPageSection(): UnitPageSection {
    return this._unit.value.pages[this._selectedPageIndex.value].sections[this._selectedPageSectionIndex.value];
  }

  getPageObservable(index: number): Observable<UnitPage> {
    return this._pages[index].asObservable();
  }

  addPage(): void {
    const newPage = UnitFactory.createUnitPage(this._unit.value.pages.length);
    newPage.sections.push(UnitFactory.createUnitPageSection());
    this._unit.value.pages.push(newPage);
    this._pages.push(new BehaviorSubject(newPage as UnitPage));

    this._unit.next(this._unit.value);
    this._selectedPageIndex.next(this._unit.value.pages.length - 1);
    this._selectedPage.next(this._unit.value.pages[this._unit.value.pages.length - 1]);
  }

  deletePage(index: number = this._selectedPageIndex.value): void {
    this._unit.value.pages.splice(index, 1);
    this._pages.splice(index, 1);

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
    const newSection = UnitFactory.createUnitPageSection();
    this._unit.value.pages[this._selectedPageIndex.value].sections.push(newSection);
    this._unit.next(this._unit.value);
    this._pages[this._selectedPageIndex.value].next(this._unit.value.pages[this._selectedPageIndex.value]); // TODO auslagern?
  }

  deleteSection(): void {
    if (this._unit.value.pages[this._selectedPageIndex.value].sections.length < 2) {
      this.messageService.showWarning('cant delete last section');
    } else {
      const index = this._selectedPageSectionIndex.value;
      this._unit.value.pages[this._selectedPageIndex.value].sections.splice(index, 1);
      this._unit.next(this._unit.value);

      this._pages[this._selectedPageIndex.value].next(this._unit.value.pages[this._selectedPageIndex.value]);
      if (this._selectedPageSectionIndex.value > 0) {
        this._selectedPageSectionIndex.next(this._selectedPageSectionIndex.value - 1);
      }
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
    newElement.dynamicPositioning = this._unit.value.pages[this._selectedPageIndex.value]
      .sections[this._selectedPageSectionIndex.value].dynamicPositioning;
    this._unit.value.pages[this._selectedPageIndex.value]
      .sections[this._selectedPageSectionIndex.value].elements.push(newElement!);

    this._pages[this._selectedPageIndex.value].next(this._unit.value.pages[this._selectedPageIndex.value]);
  }

  deleteElement(elementToDelete: UnitUIElement): void {
    const oldElements = this._unit.value.pages[this._selectedPageIndex.value]
      .sections[this._selectedPageSectionIndex.value].elements;
    this._unit.value.pages[this._selectedPageIndex.value]
      .sections[this._selectedPageSectionIndex.value].elements =
      oldElements.filter(element => element !== elementToDelete);
    this._pages[this._selectedPageIndex.value].next(this._unit.value.pages[this._selectedPageIndex.value]);
  }

  duplicateElement(elementToDuplicate: UnitUIElement): void {
    const newElement: UnitUIElement = { ...elementToDuplicate };
    newElement.id = this.idService.getNewID(newElement.type);
    newElement.xPosition += 10;
    newElement.yPosition += 10;

    this._unit.value.pages[this._selectedPageIndex.value]
      .sections[this._selectedPageSectionIndex.value].elements.push(newElement);
    this._pages[this._selectedPageIndex.value].next(this._unit.value.pages[this._selectedPageIndex.value]);
  }

  updatePageSelection(newIndex: number): void {
    this._selectedPageIndex.next(newIndex);
    this._selectedPage.next(this._unit.value.pages[newIndex]);
  }

  updatePageSectionSelection(newIndex: number): void {
    this._selectedPageSectionIndex.next(newIndex);
    this._selectedPageSection.next(this._unit.value.pages[this._selectedPageIndex.value].sections[newIndex]);
  }

  updateElementProperty(
    element: UnitUIElement, property: string, value: string | number | boolean | undefined
  ): boolean {
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
  }

  alignElements(elements: UnitUIElement[], alignmentDirection: 'left' | 'right' | 'top' | 'bottom'): void {
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

  setSectionDynamicPositioning(section: UnitPageSection, value: boolean): void {
    section.dynamicPositioning = value;
    section.elements.forEach((element: UnitUIElement) => {
      element.dynamicPositioning = value;
    });
    this.elementPropertyUpdated.next();
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
    this._pages = [];
    this._unit.value.pages.forEach((page: UnitPage) => {
      this._pages.push(new BehaviorSubject(page));
    });

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
            this.updateElementProperty(element, 'label', result);
          }
        });
        break;
      case 'text':
        this.dialogService.showTextEditDialog((element as any).text, true).subscribe((result: string) => {
          if (result) {
            this.updateElementProperty(element, 'text', result);
          }
        });
        break;
      case 'text-field':
        this.dialogService.showTextEditDialog((element as any).value).subscribe((result: string) => {
          if (result) {
            this.updateElementProperty(element, 'value', result);
          }
        });
        break;
      case 'text-area':
        this.dialogService.showTextEditDialog((element as any).value, true).subscribe((result: string) => {
          if (result) {
            this.updateElementProperty(element, 'value', result);
          }
        });
      // no default
    }
  }
}
