import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import {
  Unit, UnitPage, UnitPageSection, UnitUIElement
} from '../../../common/unit';
import { FileService } from '../../../common/file.service';
import * as UnitFactory from './UnitFactory';
import { MessageService } from '../../../common/message.service';
import { IdService } from './id.service';
import { DialogService } from './dialog.service';
import { VeronaAPIService } from './verona-api.service';

@Injectable({
  providedIn: 'root'
})
export class UnitService {
  private _unit: BehaviorSubject<Unit>;

  elementPropertyUpdated: Subject<void> = new Subject<void>();
  pageMoved: Subject<void> = new Subject<void>();
  selectedPageIndex: number = 0; // TODO weg refactorn

  constructor(private veronaApiService: VeronaAPIService,
              private messageService: MessageService,
              private idService: IdService,
              private dialogService: DialogService,
              private sanitizer: DomSanitizer) {
    const initialUnit = UnitFactory.createUnit();
    const initialPage = UnitFactory.createUnitPage(0);
    const initialSection = UnitFactory.createUnitPageSection();
    initialPage.sections.push(initialSection);
    initialUnit.pages.push(initialPage);

    this._unit = new BehaviorSubject(initialUnit);
  }

  loadUnitDefinition(unitDefinition: string): void {
    if (unitDefinition) {
      this._unit.next(JSON.parse(unitDefinition));
      this.idService.readExistingIDs(this._unit.value);
    }
  }

  get unit(): Observable<Unit> {
    return this._unit.asObservable();
  }

  addPage(): void {
    const newPage = UnitFactory.createUnitPage(this._unit.value.pages.length);
    newPage.sections.push(UnitFactory.createUnitPageSection());
    this._unit.value.pages.push(newPage);
    this._unit.next(this._unit.value);
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  deletePage(page: UnitPage): void {
    this._unit.value.pages.splice(this._unit.value.pages.indexOf(page), 1);
    this._unit.next(this._unit.value);
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  /* Reorder page in page array.
  * Checks first that the page can not be moved in front of the always visible page. */
  movePage(selectedPage: UnitPage, direction: 'up' | 'down'): void {
    if (direction === 'up' &&
        this._unit.value.pages.indexOf(selectedPage) === 1 &&
        this._unit.value.pages[0].alwaysVisible) {
      return;
    }
    UnitService.moveArrayItem(selectedPage, this._unit.value.pages, direction);
    this._unit.next(this._unit.value);
    this.pageMoved.next();
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  updatePageProperty(page: UnitPage, property: string, value: number | boolean): void {
    if (property === 'alwaysVisible' && value === true) {
      this.handlePageAlwaysVisiblePropertyChange(page);
    } else {
      page[property] = value;
    }
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  private handlePageAlwaysVisiblePropertyChange(page: UnitPage): void {
    const pageIndex = this._unit.value.pages.indexOf(page);
    if (pageIndex !== 0) { // Make page first element in page array
      this._unit.value.pages.splice(pageIndex, 1);
      this._unit.value.pages.splice(0, 0, page);
      this._unit.next(this._unit.value);
      this.pageMoved.next();
    }
    page.alwaysVisible = true;
  }

  addSection(page: UnitPage, index: number | null = null): void {
    if (index != null) {
      page.sections.splice(index, 0, UnitFactory.createUnitPageSection());
    } else {
      page.sections.push(UnitFactory.createUnitPageSection());
    }
    this._unit.next(this._unit.value);
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  deleteSection(section: UnitPageSection): void {
    if (this._unit.value.pages[this.selectedPageIndex].sections.length < 2) {
      this.messageService.showWarning('cant delete last section');
    } else {
      this._unit.value.pages[this.selectedPageIndex].sections.splice(
        this._unit.value.pages[this.selectedPageIndex].sections.indexOf(section),
        1
      );
      this._unit.next(this._unit.value);
      this.veronaApiService.sendVoeDefinitionChangedNotification();
    }
  }

  duplicateSection(section: UnitPageSection, page: UnitPage, sectionIndex: number): void {
    const newSection = { ...section };
    newSection.elements = [];
    section.elements.forEach((element: UnitUIElement) => {
      const newElement = UnitFactory.createUnitUIElement(element.type);
      newSection.elements.push({ ...newElement, ...element, id: this.idService.getNewID(element.type) });
    });
    page.sections.splice(sectionIndex + 1, 0, newSection);
    this._unit.next(this._unit.value);
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  moveSection(section: UnitPageSection, page: UnitPage, direction: 'up' | 'down'): void {
    UnitService.moveArrayItem(section, page.sections, direction);
    this._unit.next(this._unit.value);
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  setPageSections(page: UnitPage, sections: UnitPageSection[]): void {
    this._unit.value.pages[this.selectedPageIndex].sections = sections;
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  async addElementToSectionByIndex(elementType: string,
                                   pageIndex: number,
                                   sectionIndex: number,
                                   coordinates?: { x: number, y: number }): Promise<void> {
    this.addElementToSection(elementType, this._unit.value.pages[pageIndex].sections[sectionIndex], coordinates);
  }

  async addElementToSection(elementType: string,
                            section: UnitPageSection,
                            coordinates?: { x: number, y: number }): Promise<void> {
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
    newElement.dynamicPositioning = section.dynamicPositioning;
    if (coordinates && section.dynamicPositioning) {
      newElement.gridColumnStart = coordinates.x;
      newElement.gridColumnEnd = coordinates.x + 1;
      newElement.gridRowStart = coordinates.y;
      newElement.gridRowEnd = coordinates.y + 1;
    } else if (coordinates && !section.dynamicPositioning) {
      newElement.xPosition = coordinates.x;
      newElement.yPosition = coordinates.y;
    }
    section.elements.push(newElement);
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  deleteElementsFromSectionByIndex(elements: UnitUIElement[], pageIndex: number, sectionIndex: number): void {
    this.deleteElementsFromSection(elements, this._unit.value.pages[pageIndex].sections[sectionIndex]);
  }

  deleteElementsFromSection(elements: UnitUIElement[], section: UnitPageSection): void {
    section.elements = section.elements.filter(element => !elements.includes(element));
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  /* Move element between sections */
  transferElement(elements: UnitUIElement[], previousSection: UnitPageSection, newSection: UnitPageSection): void {
    previousSection.elements = previousSection.elements.filter(element => !elements.includes(element));
    elements.forEach(element => {
      newSection.elements.push(element);
      element.dynamicPositioning = newSection.dynamicPositioning;
    });
    this._unit.next(this._unit.value);
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  duplicateElementsInSectionByIndex(elements: UnitUIElement[],
                                    pageIndex: number,
                                    sectionIndex: number): void {
    this.duplicateElementsInSection(elements, this._unit.value.pages[pageIndex].sections[sectionIndex]);
  }

  duplicateElementsInSection(elements: UnitUIElement[], section: UnitPageSection): void {
    elements.forEach((element: UnitUIElement) => {
      const newElement: UnitUIElement = { ...element };
      newElement.id = this.idService.getNewID(newElement.type);
      newElement.xPosition += 10;
      newElement.yPosition += 10;
      section.elements.push(newElement);
    });
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  updateElementProperty(elements: UnitUIElement[], property: string,
                        value: string | number | boolean | string[] | undefined): void {
    elements.forEach((element: UnitUIElement) => {
      if (property === 'id') {
        if (!this.idService.isIdAvailable((value as string))) { // prohibit existing IDs
          this.messageService.showError('ID ist bereits vergeben');
          return false;
        }
        this.idService.removeId(element[property]);
        this.idService.addId(<string>value);
      }
      // TODO commented out for now.Might be useful later. Can be deleted otherwise.
      // undefined values can always be overwritten. For others check that the types match.
      // if (typeof element[property] !== 'undefined' && typeof element[property] !== typeof value) {
      //   console.warn('Wrong property type. Old:', typeof element[property], 'New: ', typeof value);
      // }
      element[property] = value;
      this.elementPropertyUpdated.next();
      return true;
    });
    this.veronaApiService.sendVoeDefinitionChangedNotification();
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
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  updateSectionProperty(section: UnitPageSection, property: string, value: string | number | boolean): void {
    if (property === 'dynamicPositioning') {
      this.setSectionDynamicPositioning(section, value as boolean);
    } else {
      section[property] = value;
    }
    this.elementPropertyUpdated.next();
    this._unit.next(this._unit.value);
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  private setSectionDynamicPositioning(section: UnitPageSection, value: boolean): void {
    section.dynamicPositioning = value;
    section.elements.forEach((element: UnitUIElement) => {
      element.dynamicPositioning = value;
    });
  }

  getUnitAsJSON(): string {
    return JSON.stringify({
      ...this._unit.value
    });
  }

  saveUnit(): void {
    FileService.saveUnitToFile(this.getUnitAsJSON());
  }

  async loadUnitFromFile(): Promise<void> {
    this.loadUnitDefinition(await FileService.loadFile(['.json']));
  }

  showDefaultEditDialog(element: UnitUIElement): void {
    switch (element.type) {
      case 'button':
      case 'dropdown':
      case 'checkbox':
      case 'radio':
        this.dialogService.showTextEditDialog(element.label as string).subscribe((result: string) => {
          if (result) {
            this.updateElementProperty([element], 'label', result);
          }
        });
        break;
      case 'text':
        this.dialogService.showRichTextEditDialog(element.text as string).subscribe((result: string) => {
          if (result) {
            // TODO add proper sanitization
            this.updateElementProperty(
              [element],
              'text',
              (this.sanitizer.bypassSecurityTrustHtml(result) as any).changingThisBreaksApplicationSecurity as string
            );
          }
        });
        break;
      case 'text-field':
        this.dialogService.showTextEditDialog(element.value as string).subscribe((result: string) => {
          if (result) {
            this.updateElementProperty([element], 'value', result);
          }
        });
        break;
      case 'text-area':
        this.dialogService.showTextEditDialog(element.value as string).subscribe((result: string) => {
          if (result) {
            this.updateElementProperty([element], 'value', result);
          }
        });
        break;
      // no default
    }
  }

  /* Silently ignores nonsense reorders! */
  private static moveArrayItem(item: unknown, array: unknown[], direction: 'up' | 'down'): void {
    const oldIndex = array.indexOf(item);

    if ((array.length > 1) &&
      !(direction === 'down' && oldIndex + 1 === array.length) && // dont allow last element down
      !(direction === 'up' && oldIndex === 0)) { // dont allow first element up
      const newIndex = direction === 'up' ? oldIndex - 1 : oldIndex + 1;
      const elements = array.splice(oldIndex, 1);
      array.splice(newIndex, 0, elements[0]);
    }
  }
}
