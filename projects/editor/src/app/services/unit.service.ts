import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { FileService } from './file.service';
import { MessageService } from '../../../../common/services/message.service';
import { IdService } from './id.service';
import { DialogService } from './dialog.service';
import { VeronaAPIService } from './verona-api.service';
import { SelectionService } from './selection.service';
import { ElementFactory } from '../../../../common/util/element.factory';
import { ClozeParser } from '../util/cloze-parser';
import { Copy } from '../../../../common/util/copy';
import { UnitFactory } from '../../../../common/util/unit.factory';
import { Page, Section, Unit } from '../../../../common/interfaces/unit';
import {
  ClozeElement, DragNDropValueObject,
  DropListElement, InputElement, InputElementValue, LikertElement,
  LikertRowElement, PlayerElement, PlayerProperties,
  PositionedElement, TextElement,
  UIElement, UIElementType
} from '../../../../common/interfaces/elements';
import { UnitDefinitionSanitizer } from '../../../../common/util/unit-definition-sanitizer';
import { LikertColumn, LikertRow } from '../../../../common/interfaces/likert';
import { ClozeDocument } from '../../../../common/interfaces/cloze';
import { UnitUtils } from '../../../../common/util/unit-utils';
import { ArrayUtils } from '../../../../common/util/array';
import { ClozeUtils } from '../../../../common/util/cloze';

@Injectable({
  providedIn: 'root'
})
export class UnitService {
  unit: Unit;

  elementPropertyUpdated: Subject<void> = new Subject<void>();

  constructor(private selectionService: SelectionService,
              private idService: IdService,
              private veronaApiService: VeronaAPIService,
              private messageService: MessageService,
              private dialogService: DialogService,
              private sanitizer: DomSanitizer,
              private translateService: TranslateService) {
    this.unit = UnitFactory.createUnit({} as Unit);
  }

  loadUnitDefinition(unitDefinition: string): void {
    this.idService.reset();
    this.unit = UnitFactory.createUnit(UnitDefinitionSanitizer.sanitizeUnitDefinition(JSON.parse(unitDefinition)));
    UnitService.readIDs(this.unit);
  }

  private static readIDs(unit: Unit): void {
    UnitUtils.findUIElements(unit).forEach(element => {
      if (element.type === 'likert') {
        (element as LikertElement).rows.forEach(row => IdService.getInstance().addID(row.id));
      }
      if (element.type === 'cloze') {
        ClozeUtils.getClozeChildElements((element as ClozeElement).document)
          .forEach(child => IdService.getInstance().addID(child.id));
      }
      IdService.getInstance().addID(element.id);
    });
  }

  unitUpdated(): void {
    this.veronaApiService.sendVoeDefinitionChangedNotification(JSON.stringify(this.unit));
  }

  addSection(page: Page): void {
    page.sections.push(UnitFactory.createSection());
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  deleteSection(section: Section): void {
    this.unit.pages[this.selectionService.selectedPageIndex].sections.splice(
      this.unit.pages[this.selectionService.selectedPageIndex].sections.indexOf(section),
      1
    );
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  duplicateSection(section: Section, page: Page, sectionIndex: number): void {
    const newSection = JSON.parse(JSON.stringify(section));
    newSection.elements.forEach((element: UIElement) => {
      element.id = this.idService.getNewID(element.type);
    });
    page.sections.splice(sectionIndex + 1, 0, newSection);
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  moveSection(section: Section, page: Page, direction: 'up' | 'down'): void {
    ArrayUtils.moveArrayItem(section, page.sections, direction);
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
      } as unknown as UIElement) as PositionedElement;
    } else {
      newElement = ElementFactory.createElement({
        type: elementType,
        id: this.idService.getNewID(elementType),
        positionProps: {
          dynamicPositioning: section.dynamicPositioning
        }
      } as unknown as UIElement) as PositionedElement;
    }
    if (coordinates && section.dynamicPositioning) {
      newElement.position.gridColumnStart = coordinates.x;
      newElement.position.gridColumnEnd = coordinates.x + 1;
      newElement.position.gridRowStart = coordinates.y;
      newElement.position.gridRowEnd = coordinates.y + 1;
    } else if (coordinates && !section.dynamicPositioning) {
      newElement.position.xPosition = coordinates.x;
      newElement.position.yPosition = coordinates.y;
    }
    section.elements.push(newElement);
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  deleteElements(elements: UIElement[]): void {
    this.freeUpIds(elements);
    this.unit.pages[this.selectionService.selectedPageIndex].sections.forEach(section => {
      section.elements = section.elements.filter(element => !elements.includes(element));
    });
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  private freeUpIds(elements: UIElement[]): void {
    elements.forEach(element => {
      if (element.type === 'drop-list') {
        ((element as DropListElement).value as DragNDropValueObject[]).forEach((value: DragNDropValueObject) => {
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
      (element as PositionedElement).position.dynamicPositioning = newSection.dynamicPositioning;
    });
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  duplicateElementsInSection(elements: UIElement[], pageIndex: number, sectionIndex: number): void {
    const section = this.unit.pages[pageIndex].sections[sectionIndex];

    (elements as PositionedElement[]).forEach((element: PositionedElement) => {
      const newElement = JSON.parse(JSON.stringify(element));
      newElement.id = this.idService.getNewID(element.type);
      newElement.positionProps.xPosition = element.position.xPosition + 10;
      newElement.positionProps.yPosition = element.position.yPosition + 10;

      if ('value' in newElement && newElement.value instanceof Object) { // replace value Ids with fresh ones (dropList)
        newElement.value.forEach((valueObject: { id: string }) => {
          valueObject.id = this.idService.getNewID('value');
        });
      }

      if ('row' in newElement && newElement.rows instanceof Object) { // replace row Ids with fresh ones (likert)
        newElement.rows.forEach((rowObject: { id: string }) => {
          rowObject.id = this.idService.getNewID('likert_row');
        });
      }

      if (newElement.type === 'cloze') {
        ClozeUtils.getClozeChildElements(newElement).forEach((childElement: InputElement) => {
          childElement.id = this.idService.getNewID(childElement.type);
          if (typeof childElement.value === 'object') { // replace value Ids with fresh ones (dropList)
            (childElement.value as DragNDropValueObject[]).forEach((valueObject: DragNDropValueObject) => {
              valueObject.id = this.idService.getNewID('value');
            });
          }
        });
      }
      section.elements.push(newElement as PositionedElement);
    });

    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  updateSectionProperty(section: Section, property: string, value: string | number | boolean): void {
    if (property === 'dynamicPositioning') {
      section.dynamicPositioning = value as boolean;
      section.elements.forEach((element: PositionedElement) => {
        element.position.dynamicPositioning = value as boolean;
      });
    } else {
      section[property] = value;
    }
    this.elementPropertyUpdated.next();
    this.veronaApiService.sendVoeDefinitionChangedNotification();
  }

  updateElementProperty(elements: UIElement[],
                        property: string,
                        value: InputElementValue | LikertColumn[] | LikertRow[] | ClozeDocument |
                        DragNDropValueObject[] | null): boolean {
    console.log('updateElementProperty', elements, property, value);
    elements.forEach(element => {
      if (property === 'id') {
        if (!this.idService.isIdAvailable((value as string))) { // prohibit existing IDs
          this.messageService.showError(this.translateService.instant('idTaken'));
        } else {
          this.idService.removeId(element.id);
          this.idService.addID(value as string);
          element.id = value as string;
        }
      } else if (property === 'document') {
        element[property] = ClozeParser.setMissingIDs(value as ClozeDocument, this.idService);
      } else if (element.type === 'likert') {
        if (property === 'columns') {
          (element as LikertElement).rows.forEach(row => {
            row.columnCount = (element as LikertElement).columns.length;
          });
        } else if (property === 'readOnly') {
          (element as LikertElement).rows.forEach(row => {
            row.readOnly = value as boolean;
          });
        }
      } else if (['fixedSize', 'dynamicPositioning', 'xPosition', 'yPosition', 'useMinHeight', 'gridColumnStart',
        'gridColumnEnd', 'gridRowStart', 'gridRowEnd', 'marginLeft', 'marginRight', 'marginTop',
        'marginBottom', 'zIndex'].includes(property)) {
        element.position![property] = Copy.getCopy(value);
      } else if (['fontColor', 'font', 'fontSize', 'lineHeight', 'bold', 'italic', 'underline',
        'backgroundColor', 'borderRadius', 'itemBackgroundColor', 'borderWidth', 'borderColor',
        'borderStyle', 'lineColoring', 'lineColoringColor'].includes(property)) {
        element.styling![property] = Copy.getCopy(value);
      } else if (['autostart', 'autostartDelay', 'loop', 'startControl', 'pauseControl',
        'progressBar', 'interactiveProgressbar', 'volumeControl', 'defaultVolume', 'minVolume',
        'muteControl', 'interactiveMuteControl', 'hintLabel', 'hintLabelDelay', 'activeAfterID',
        'minRuns', 'maxRuns', 'showRestRuns', 'showRestTime', 'playbackTime'].includes(property)) {
        element.player![property] = Copy.getCopy(value);
      } else {
        element[property] = Copy.getCopy(value);
      }
    });
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

  async editLikertRow(row: LikertRowElement, columns: LikertColumn[]): Promise<void> {
    await this.dialogService.showLikertRowEditDialog(row, columns)
      .subscribe((result: LikertRowElement) => {
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

  createLikertRow(question: string, columnCount: number): LikertRowElement {
    return ElementFactory.createLikertRowElement({
      id: this.idService.getNewID('likert_row'),
      text: question,
      columnCount: columnCount
    });
  }

  alignElements(elements: PositionedElement[], alignmentDirection: 'left' | 'right' | 'top' | 'bottom'): void {
    switch (alignmentDirection) {
      case 'left':
        this.updateElementProperty(
          elements,
          'xPosition',
          Math.min(...elements.map(element => element.position.xPosition))
        );
        break;
      case 'right':
        this.updateElementProperty(
          elements,
          'xPosition',
          Math.max(...elements.map(element => element.position.xPosition))
        );
        break;
      case 'top':
        this.updateElementProperty(
          elements,
          'yPosition',
          Math.min(...elements.map(element => element.position.yPosition))
        );
        break;
      case 'bottom':
        this.updateElementProperty(
          elements,
          'yPosition',
          Math.max(...elements.map(element => element.position.yPosition))
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
        this.dialogService.showTextEditDialog(element.label as string).subscribe((result: string) => {
          if (result) {
            this.updateElementProperty([element], 'label', result);
          }
        });
        break;
      case 'text':
        this.dialogService.showRichTextEditDialog(
          (element as TextElement).text,
          (element as TextElement).styling.fontSize
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
        this.dialogService.showClozeTextEditDialog(
          (element as ClozeElement).document,
          (element as ClozeElement).styling.fontSize
        ).subscribe((result: string) => {
          if (result) {
            // TODO add proper sanitization
            this.updateElementProperty(
              [element],
              'document',
              (this.sanitizer.bypassSecurityTrustHtml(result) as any).changingThisBreaksApplicationSecurity as string
            );
          }
        });
        break;
      case 'text-field':
        this.dialogService.showTextEditDialog((element as InputElement).value as string)
          .subscribe((result: string) => {
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
        this.dialogService.showPlayerEditDialog((element as PlayerElement).player)
          .subscribe((result: PlayerProperties) => {
            Object.keys(result).forEach(key => this.updateElementProperty([element], key, result[key]));
          });
        break;
      // no default
    }
  }

  getNewValueID(): string {
    return this.idService.getNewID('value');
  }
}
