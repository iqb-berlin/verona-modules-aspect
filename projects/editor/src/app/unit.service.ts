import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { FileService } from '../../../common/file.service';
import { MessageService } from '../../../common/message.service';
import { IdService } from '../../../common/id.service';
import { DialogService } from './dialog.service';
import { VeronaAPIService } from './verona-api.service';
import { Unit } from '../../../common/models/unit';
import { Page } from '../../../common/models/page';
import { Section } from '../../../common/models/section';
import { InputElement, UIElement, UIElementType } from '../../../common/models/uI-element';
import { TextElement } from '../../../common/models/text-element';
import { LikertElement } from '../../../common/models/compound-elements/likert-element';
import { LikertElementRow } from '../../../common/models/compound-elements/likert-element-row';
import { LikertColumn, LikertRow, PlayerElement } from '../../../common/interfaces/UIElementInterfaces';
import { SelectionService } from './selection.service';
import * as ElementFactory from '../../../common/util/element.factory';

@Injectable({
  providedIn: 'root'
})
export class UnitService {
  unitModel: Unit;
  private _unit: BehaviorSubject<Unit>;

  elementPropertyUpdated: Subject<void> = new Subject<void>();
  pageMoved: Subject<void> = new Subject<void>();

  constructor(private selectionService: SelectionService,
              private veronaApiService: VeronaAPIService,
              private messageService: MessageService,
              private dialogService: DialogService,
              private sanitizer: DomSanitizer,
              private translateService: TranslateService) {
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
    this.unitModel.deletePage(page);
    this._unit.next(this._unit.value);
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  movePage(selectedPage: Page, direction: 'up' | 'down'): void {
    this.unitModel.movePage(selectedPage, direction);
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

  addSection(page: Page): void {
    page.addSection();
    this._unit.next(this._unit.value);
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  deleteSection(section: Section): void {
    this.unitModel.pages[this.selectionService.selectedPageIndex].deleteSection(section);
    this._unit.next(this._unit.value);
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  duplicateSection(section: Section, page: Page, sectionIndex: number): void {
    page.duplicateSection(section, sectionIndex);
    this._unit.next(this._unit.value);
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  moveSection(section: Section, page: Page, direction: 'up' | 'down'): void {
    page.moveSection(section, direction);
    this._unit.next(this._unit.value);
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  addElementToSectionByIndex(elementType: UIElementType,
                             pageIndex: number,
                             sectionIndex: number): void {
    this.addElementToSection(elementType, this._unit.value.pages[pageIndex].sections[sectionIndex]);
  }

  async addElementToSection(elementType: UIElementType,
                            section: Section,
                            coordinates?: { x: number, y: number }): Promise<void> {
    let newElement;
    if (['audio', 'video', 'image'].includes(elementType)) {
      let mediaSrc = '';
      switch (elementType) {
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
      newElement = ElementFactory.createElement(
        { type: elementType, dynamicPositioning: section.dynamicPositioning, src: mediaSrc } as unknown as UIElement
      );
    } else {
      newElement = ElementFactory.createElement(
        { type: elementType, dynamicPositioning: section.dynamicPositioning } as UIElement
      );
    }
    if (coordinates && section.dynamicPositioning) {
      newElement.gridColumnStart = coordinates.x;
      newElement.gridColumnEnd = coordinates.x + 1;
      newElement.gridRowStart = coordinates.y;
      newElement.gridRowEnd = coordinates.y + 1;
    } else if (coordinates && !section.dynamicPositioning) {
      newElement.xPosition = coordinates.x;
      newElement.yPosition = coordinates.y;
    }
    section.addElement(newElement);
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  deleteElementsFromSectionByIndex(elements: UIElement[], pageIndex: number, sectionIndex: number): void {
    this.deleteElementsFromSection(elements, this._unit.value.pages[pageIndex].sections[sectionIndex]);
  }

  deleteElementsFromSection(elements: UIElement[], section: Section): void {
    section.deleteElements(elements);
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
    section.duplicateElements(elements);
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  updateSectionProperty(section: Section, property: string, value: string | number | boolean): void {
    section.updateProperty(property, value);
    this.elementPropertyUpdated.next();
    this._unit.next(this._unit.value);
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  updateElementProperty(elements: UIElement[], property: string,
                        value: string | number | boolean | string[] |
                        LikertColumn[] | LikertRow[] | null): boolean {
    console.log('updateElementProperty', property, value);
    for (const element of elements) {
      if (property === 'id') {
        if (!IdService.getInstance().isIdAvailable((value as string))) { // prohibit existing IDs
          this.messageService.showError(this.translateService.instant('idTaken'));
          return false;
        }
        IdService.getInstance().removeId(element[property]);
        IdService.getInstance().addId(<string>value);
      }
      element.setProperty(property, value);
    }
    this.elementPropertyUpdated.next();
    this.veronaApiService.sendVoeDefinitionChangedNotification();
    return true;
  }

  async editTextOption(property: string, optionIndex: number): Promise<void> {
    const oldOptions = this.selectionService.getSelectedElements()[0][property] as string[];
    await this.dialogService.showTextEditDialog(oldOptions[optionIndex])
      .subscribe((result: string) => {
        if (result) {
          oldOptions[optionIndex] = result;
          this.updateElementProperty(this.selectionService.getSelectedElements(), property, oldOptions);
        }
      });
  }

  async editLikertRow(row: LikertElementRow, columns: LikertColumn[]): Promise<void> {
    await this.dialogService.showLikertRowEditDialog(row, columns)
      .subscribe((result: LikertElementRow) => {
        if (result) {
          if (result.id !== row.id) {
            this.updateElementProperty(
              [row],
              'id',
              result.id
            );
          }
          if (result.text !== row.text) {
            this.updateElementProperty(
              [row],
              'text',
              result.text
            );
          }
          if (result.value !== row.value) {
            this.updateElementProperty(
              [row],
              'value',
              result.value
            );
          }
        }
      });
  }

  async editLikertColumn(likertElements: LikertElement[], columnIndex: number): Promise<void> {
    await this.dialogService.showLikertColumnEditDialog(likertElements[0].columns[columnIndex])
      .subscribe((result: LikertColumn) => {
        if (result) {
          likertElements[0].columns[columnIndex] = result;
          this.updateElementProperty(
            likertElements,
            'columns',
            likertElements[0].columns
          );
        }
      });
  }

  static createLikertColumn(value: string): LikertColumn {
    return {
      text: value,
      imgSrc: null,
      position: 'above'
    };
  }

  static createLikertRow(question: string, columnCount: number): LikertElementRow {
    return new LikertElementRow(
      {
        type: 'likert_row',
        text: question,
        columnCount: columnCount
      } as LikertElementRow
    );
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
      case 'audio':
      case 'video':
        this.dialogService.showPlayerEditDialog(element as unknown as PlayerElement)
          .subscribe((result: PlayerElement) => {
            if (result) {
              for (const key in result) {
                // @ts-ignore
                this.updateElementProperty([element], key, result[key]);
              }
            }
          });
        break;
      // no default
    }
  }
}
