import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { FileService } from '../../../common/file.service';
import { MessageService } from '../../../common/message.service';
import { IdService } from '../../../common/id.service';
import { DialogService } from './dialog.service';
import { VeronaAPIService } from './verona-api.service';
import { Unit } from '../../../common/classes/unit';
import { Page } from '../../../common/classes/page';
import { Section } from '../../../common/classes/section';
import { InputElement, UIElement } from '../../../common/classes/uI-element';
import { TextElement } from '../../../common/classes/text-element';

@Injectable({
  providedIn: 'root'
})
export class UnitService {
  unitModel: Unit;
  private _unit: BehaviorSubject<Unit>;

  elementPropertyUpdated: Subject<void> = new Subject<void>();
  pageMoved: Subject<void> = new Subject<void>();
  selectedPageIndex: number = 0; // TODO weg refactorn

  constructor(private veronaApiService: VeronaAPIService,
              private messageService: MessageService,
              private dialogService: DialogService,
              private sanitizer: DomSanitizer) {
    this.unitModel = new Unit();
    this._unit = new BehaviorSubject(this.unitModel);
  }

  loadUnitDefinition(unitDefinition: string): void {
    if (unitDefinition) {
      this.unitModel = new Unit(JSON.parse(unitDefinition));
      this.unitModel.pages.forEach((page: Page) => {
        page.sections.forEach((section: Section) => {
          section.elements.forEach((element: UIElement) => {
            IdService.getInstance().addID(element.id);
          });
        });
      });
      this._unit.next(this.unitModel);
    }
  }

  get unit(): Observable<Unit> {
    return this._unit.asObservable();
  }

  addPage(): void {
    this.unitModel.addPage();
    this._unit.next(this._unit.value);
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  deletePage(page: Page): void {
    this.unitModel.deletePage(page as unknown as Page);
    this._unit.next(this._unit.value);
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  movePage(selectedPage: Page, direction: 'up' | 'down'): void {
    this.unitModel.movePage(selectedPage as unknown as Page, direction);
    this._unit.next(this._unit.value);
    this.pageMoved.next();
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  updatePageProperty(page: Page, property: string, value: number | boolean): void {
    if (property === 'alwaysVisible' && value === true) {
      this.handlePageAlwaysVisiblePropertyChange(page);
    }
    page[property] = value;
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  private handlePageAlwaysVisiblePropertyChange(page: Page): void {
    const pageIndex = this._unit.value.pages.indexOf(page);
    if (pageIndex !== 0) {
      this.unitModel.movePageToTop(pageIndex, page);
      this._unit.next(this._unit.value);
      this.pageMoved.next();
    }
    page.alwaysVisible = true;
  }

  addSection(page: Page, index: number | null = null): void {
    (page as unknown as Page).addSection();
    this._unit.next(this._unit.value);
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  deleteSection(section: Section): void {
    (this.unitModel.pages[this.selectedPageIndex] as unknown as Page).deleteSection(section as unknown as Section);
    this._unit.next(this._unit.value);
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  duplicateSection(section: Section, page: Page, sectionIndex: number): void {
    (page as unknown as Page).duplicateSection(section as unknown as Section, sectionIndex);
    this._unit.next(this._unit.value);
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  moveSection(section: Section, page: Page, direction: 'up' | 'down'): void {
    (page as unknown as Page).moveSection(section as unknown as Section, direction);
    this._unit.next(this._unit.value);
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  async addElementToSectionByIndex(elementType: string,
                                   pageIndex: number,
                                   sectionIndex: number,
                                   coordinates?: { x: number, y: number }): Promise<void> {
    this.addElementToSection(elementType, this._unit.value.pages[pageIndex].sections[sectionIndex], coordinates);
  }

  async addElementToSection(elementType: string,
                            section: Section,
                            coordinates?: { x: number, y: number }): Promise<void> {
    section.addElement(elementType, coordinates);
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  deleteElementsFromSectionByIndex(elements: UIElement[], pageIndex: number, sectionIndex: number): void {
    this.deleteElementsFromSection(elements, this._unit.value.pages[pageIndex].sections[sectionIndex]);
  }

  deleteElementsFromSection(elements: UIElement[], section: Section): void {
    (section as unknown as Section).deleteElements(elements);
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  /* Move element between sections */
  transferElement(elements: UIElement[], previousSection: Section, newSection: Section): void {
    previousSection.elements = previousSection.elements.filter(element => !elements.includes(element));
    elements.forEach(element => {
      newSection.elements.push(element);
      element.dynamicPositioning = newSection.dynamicPositioning;
    });
    this._unit.next(this._unit.value);
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  duplicateElementsInSectionByIndex(elements: UIElement[],
                                    pageIndex: number,
                                    sectionIndex: number): void {
    this.duplicateElementsInSection(elements, this._unit.value.pages[pageIndex].sections[sectionIndex]);
  }

  duplicateElementsInSection(elements: UIElement[], section: Section): void {
    (section as unknown as Section).duplicateElements(elements);
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  updateSectionProperty(section: Section, property: string, value: string | number | boolean): void {
    section.updateProperty(property, value);
    this.elementPropertyUpdated.next();
    this._unit.next(this._unit.value);
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  updateElementProperty(elements: UIElement[], property: string,
                        value: string | number | boolean | string[] | null): void {
    elements.forEach((element: UIElement) => {
      if (property === 'id') {
        if (!IdService.getInstance().isIdAvailable((value as string))) { // prohibit existing IDs
          this.messageService.showError('ID ist bereits vergeben');
          return false;
        }
        IdService.getInstance().removeId(element[property]);
        IdService.getInstance().addId(<string>value);
      }
      if (Array.isArray(value)) {
        element[property] = [...value];
      } else {
        element[property] = value;
      }
      this.elementPropertyUpdated.next();
      return true;
    });
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  alignElements(elements: UIElement[], alignmentDirection: 'left' | 'right' | 'top' | 'bottom'): void {
    Section.alignElements(elements, alignmentDirection);
    this.elementPropertyUpdated.next();
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  getUnitAsJSON(): string {
    return JSON.stringify({
      ...this.unitModel
    });
  }

  saveUnit(): void {
    FileService.saveUnitToFile(this.getUnitAsJSON());
  }

  async loadUnitFromFile(): Promise<void> {
    this.loadUnitDefinition(await FileService.loadFile(['.json']));
  }

  showDefaultEditDialog(element: UIElement): void {
    switch (element.type) {
      case 'button':
      case 'dropdown':
      case 'checkbox':
      case 'radio':
        this.dialogService.showTextEditDialog((element as InputElement).label).subscribe((result: string) => {
          if (result) {
            this.updateElementProperty([element], 'label', result);
          }
        });
        break;
      case 'text':
        this.dialogService.showRichTextEditDialog((element as TextElement).text).subscribe((result: string) => {
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
        this.dialogService.showTextEditDialog((element as InputElement).value as string).subscribe((result: string) => {
          if (result) {
            this.updateElementProperty([element], 'value', result);
          }
        });
        break;
      case 'text-area':
        this.dialogService.showTextEditDialog((element as InputElement).value as string).subscribe((result: string) => {
          if (result) {
            this.updateElementProperty([element], 'value', result);
          }
        });
        break;
      // no default
    }
  }
}
