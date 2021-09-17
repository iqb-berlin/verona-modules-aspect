import { Injectable } from '@angular/core';
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
              private dialogService: DialogService) {
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

  /* reorder page in page array */
  movePage(selectedPage: UnitPage, direction: 'up' | 'down'): void {
    const oldPageIndex = this._unit.value.pages.indexOf(selectedPage);
    if ((this._unit.value.pages.length > 1) &&
        !(direction === 'down' && oldPageIndex + 1 === this._unit.value.pages.length) && // dont allow last page down
        !(direction === 'up' && oldPageIndex === 0) && // dotn allow first page up
        // dont allow second page to go before always shown page
        !(direction === 'up' && oldPageIndex === 1 && this._unit.value.pages[0].alwaysVisible) &&
        !(selectedPage.alwaysVisible)) {
      const newPageIndex = direction === 'up' ? oldPageIndex - 1 : oldPageIndex + 1;
      const page = this._unit.value.pages.splice(oldPageIndex, 1);
      this._unit.value.pages.splice(newPageIndex, 0, page[0]);
      this._unit.next(this._unit.value);
      this.pageMoved.next();
      this.veronaApiService.sendVoeDefinitionChangedNotification();
    }
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

  setPageSections(page: UnitPage, sections: UnitPageSection[]): void {
    this._unit.value.pages[this.selectedPageIndex].sections = sections;
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  async addElementToSection(elementType: string,
                            section: UnitPageSection,
                            elementCoordinates?: Record<string, number>): Promise<void> {
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
    if (elementCoordinates) {
      newElement.xPosition = elementCoordinates.x;
      newElement.yPosition = elementCoordinates.y;
    }
    section.elements.push(newElement);
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  deleteElementsFromSection(elements: UnitUIElement[], section: UnitPageSection): void {
    section.elements = section.elements.filter(element => !elements.includes(element));
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  /* Move element between sections */
  transferElement(elements: UnitUIElement[], previousSection: UnitPageSection, newSection: UnitPageSection): void {
    previousSection.elements = previousSection.elements.filter(element => !elements.includes(element));
    elements.forEach(element => newSection.elements.push(element));
    this._unit.next(this._unit.value);
    this.veronaApiService.sendVoeDefinitionChangedNotification();
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
      // undefined values can always be set. For others check that the types match.
      if (typeof element[property] !== 'undefined' && typeof element[property] !== typeof value) {
        return false;
      }
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
            this.updateElementProperty([element], 'text', result);
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
}
