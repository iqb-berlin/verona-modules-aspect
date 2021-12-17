import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { FileService } from './file.service';
import { MessageService } from '../../../../common/services/message.service';
import { IdService } from './id.service';
import { DialogService } from './dialog.service';
import { VeronaAPIService } from './verona-api.service';
import { Unit } from '../../../../common/models/unit';
import { Page } from '../../../../common/models/page';
import { Section } from '../../../../common/models/section';
import {
  DragNDropValueObject,
  InputElement, InputElementValue,
  LikertColumn,
  LikertRow, PlayerElement,
  PlayerProperties, PositionedElement,
  UIElement,
  UIElementType
} from '../../../../common/models/uI-element';
import { TextElement } from '../../../../common/ui-elements/text/text-element';
import { LikertElement } from '../../../../common/ui-elements/likert/likert-element';
import { LikertElementRow } from '../../../../common/ui-elements/likert/likert-element-row';
import { SelectionService } from './selection.service';
import { ElementFactory } from '../../../../common/util/element.factory';
import { ClozeParser } from '../util/cloze-parser';

@Injectable({
  providedIn: 'root'
})
export class UnitService {
  unit: Unit;

  elementPropertyUpdated: Subject<void> = new Subject<void>();
  pageMoved: Subject<void> = new Subject<void>();

  constructor(private selectionService: SelectionService,
              private idService: IdService,
              private veronaApiService: VeronaAPIService,
              private messageService: MessageService,
              private dialogService: DialogService,
              private sanitizer: DomSanitizer,
              private translateService: TranslateService) {
    this.unit = new Unit();
  }

  loadUnitDefinition(unitDefinition: string): void {
    if (unitDefinition) {
      this.unit = new Unit(JSON.parse(unitDefinition));
      this.readExistingIDs();
    }
  }

  private readExistingIDs(): void {
    this.unit.pages.forEach((page: Page) => {
      page.sections.forEach((section: Section) => {
        section.elements.forEach((element: UIElement) => {
          this.idService.addID(element.id);
          if (element.type === 'drop-list') {
            element.value?.forEach((valueElement: DragNDropValueObject) => {
              this.idService.addID(valueElement.id);
            });
          }
        });
      });
    });
  }

  addPage(): void {
    this.unit.addPage();
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  deletePage(page: Page): void {
    this.unit.deletePage(page);
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  movePage(selectedPage: Page, direction: 'up' | 'down'): void {
    this.unit.movePage(selectedPage, direction);
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
    const pageIndex = this.unit.pages.indexOf(page);
    if (pageIndex !== 0) {
      this.unit.movePageToTop(pageIndex, page);
      this.pageMoved.next();
    }
    page.alwaysVisible = true;
  }

  addSection(page: Page): void {
    page.addSection();
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  deleteSection(section: Section): void {
    this.unit.pages[this.selectionService.selectedPageIndex].deleteSection(section);
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  duplicateSection(section: Section, page: Page, sectionIndex: number): void {
    const newSection = new Section(section);
    newSection.elements.forEach((element: UIElement) => {
      element.id = this.idService.getNewID(element.type);
    });
    page.sections.splice(sectionIndex + 1, 0, newSection);
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  moveSection(section: Section, page: Page, direction: 'up' | 'down'): void {
    page.moveSection(section, direction);
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  addElementToSectionByIndex(elementType: UIElementType,
                             pageIndex: number,
                             sectionIndex: number): void {
    this.addElementToSection(elementType, this.unit.pages[pageIndex].sections[sectionIndex]);
  }

  async addElementToSection(elementType: UIElementType,
                            section: Section,
                            coordinates?: { x: number, y: number }): Promise<void> {
    let newElement: PositionedElement;
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
      newElement = ElementFactory.createElement({
        type: elementType,
        id: this.idService.getNewID(elementType),
        src: mediaSrc,
        positionProps: {
          dynamicPositioning: section.dynamicPositioning
        }
      } as unknown as Partial<UIElement>) as PositionedElement;
    } else {
      newElement = ElementFactory.createElement({
        type: elementType,
        id: this.idService.getNewID(elementType),
        positionProps: {
          dynamicPositioning: section.dynamicPositioning
        }
      } as unknown as Partial<UIElement>) as PositionedElement;
    }
    if (coordinates && section.dynamicPositioning) {
      newElement.positionProps.gridColumnStart = coordinates.x;
      newElement.positionProps.gridColumnEnd = coordinates.x + 1;
      newElement.positionProps.gridRowStart = coordinates.y;
      newElement.positionProps.gridRowEnd = coordinates.y + 1;
    } else if (coordinates && !section.dynamicPositioning) {
      newElement.positionProps.xPosition = coordinates.x;
      newElement.positionProps.yPosition = coordinates.y;
    }
    section.addElement(newElement as PositionedElement);
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  deleteElements(elements: UIElement[]): void {
    this.freeUpIds(elements);
    this.unit.pages[this.selectionService.selectedPageIndex].sections.forEach(section => {
      section.deleteElements(elements);
    });
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  private freeUpIds(elements: UIElement[]): void {
    elements.forEach(element => {
      if (element.type === 'drop-list') {
        element.value.forEach((value: DragNDropValueObject) => {
          this.idService.removeId(value.id);
        });
      }
      this.idService.removeId(element.id);
    });
  }

  /* Move element between sections */
  transferElement(elements: UIElement[], previousSection: Section, newSection: Section): void {
    previousSection.elements = previousSection.elements.filter(element => !elements.includes(element));
    elements.forEach(element => {
      newSection.elements.push(element as PositionedElement);
      (element as PositionedElement).positionProps.dynamicPositioning = newSection.dynamicPositioning;
    });
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  duplicateElementsInSection(elements: UIElement[],
                             pageIndex: number,
                             sectionIndex: number): void {
    const section = this.unit.pages[pageIndex].sections[sectionIndex];

    (elements as PositionedElement[]).forEach((element: PositionedElement) => {
      const newElement = ElementFactory.createElement({
        ...JSON.parse(JSON.stringify(element)),
        id: this.idService.getNewID(element.type),
        positionProps: {
          xPosition: element.positionProps.xPosition + 10,
          yPosition: element.positionProps.yPosition + 10
        }
      } as unknown as Partial<PositionedElement>);
      if (newElement.value instanceof Object) { // replace value Ids with fresh ones (dropList)
        newElement.value.forEach((valueObject: { id: string }) => {
          valueObject.id = this.idService.getNewID('value');
        });
      }
      if (newElement.rows instanceof Object) { // replace row Ids with fresh ones (likert)
        newElement.rows.forEach((rowObject: { id: string }) => {
          rowObject.id = this.idService.getNewID('likert_row');
        });
      }
      section.elements.push(newElement as PositionedElement);
    });

    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  updateSectionProperty(section: Section, property: string, value: string | number | boolean): void {
    section.updateProperty(property, value);
    this.elementPropertyUpdated.next();
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  updateElementProperty(elements: UIElement[], property: string,
                        value: InputElementValue | LikertColumn[] | LikertRow[] |
                        DragNDropValueObject[] | null): boolean {
    // console.log('updateElementProperty', elements, property, value);
    for (const element of elements) {
      if (property === 'id') {
        if (!this.idService.isIdAvailable((value as string))) { // prohibit existing IDs
          this.messageService.showError(this.translateService.instant('idTaken'));
          return false;
        }
        this.idService.removeId(element.id);
        this.idService.addID(<string>value);
      } else if (property === 'text' && element.type === 'cloze') {
        element.setProperty('parts', ClozeParser.createClozeParts(value as string, this.idService));
      } else {
        element.setProperty(property, value);
      }
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

  async editDropListOption(optionIndex: number): Promise<void> {
    const oldOptions = this.selectionService.getSelectedElements()[0].value as DragNDropValueObject[];
    await this.dialogService.showDropListOptionEditDialog(oldOptions[optionIndex])
      .subscribe((result: DragNDropValueObject) => {
        if (result) {
          if (result.id !== oldOptions[optionIndex].id && !this.idService.isIdAvailable(result.id)) {
            this.messageService.showError(this.translateService.instant('idTaken'));
            return;
          }
          oldOptions[optionIndex] = result;
          this.updateElementProperty(this.selectionService.getSelectedElements(), 'value', oldOptions);
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

  createLikertRow(question: string, columnCount: number): LikertElementRow {
    return new LikertElementRow(
      {
        type: 'likert_row',
        id: this.idService.getNewID('likert_row'),
        text: question,
        columnCount: columnCount
      } as LikertElementRow
    );
  }

  alignElements(elements: PositionedElement[], alignmentDirection: 'left' | 'right' | 'top' | 'bottom'): void {
    switch (alignmentDirection) {
      case 'left':
        this.updateElementProperty(
          elements,
          'xPosition',
          Math.min(...elements.map(element => element.positionProps.xPosition))
        );
        break;
      case 'right':
        this.updateElementProperty(
          elements,
          'xPosition',
          Math.max(...elements.map(element => element.positionProps.xPosition))
        );
        break;
      case 'top':
        this.updateElementProperty(
          elements,
          'yPosition',
          Math.min(...elements.map(element => element.positionProps.yPosition))
        );
        break;
      case 'bottom':
        this.updateElementProperty(
          elements,
          'yPosition',
          Math.max(...elements.map(element => element.positionProps.yPosition))
        );
        break;
      // no default
    }
    this.elementPropertyUpdated.next();
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  saveUnit(): void {
    FileService.saveUnitToFile(JSON.stringify(this.unit));
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
        this.dialogService.showRichTextEditDialog(
          (element as TextElement).text, (element as TextElement).fontProps.fontSize as number
        ).subscribe((result: string) => {
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
      case 'cloze':
        this.dialogService.showClozeTextEditDialog((element as TextElement).text).subscribe((result: string) => {
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
        this.dialogService.showMultilineTextEditDialog((element as InputElement).value as string)
          .subscribe((result: string) => {
            if (result) {
              this.updateElementProperty([element], 'value', result);
            }
          });
        break;
      case 'audio':
      case 'video':
        this.dialogService.showPlayerEditDialog((element as PlayerElement).playerProps)
          .subscribe((result: PlayerProperties) => {
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

  getNewValueID(): string {
    return this.idService.getNewID('value');
  }
}
