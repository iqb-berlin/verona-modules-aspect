import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { FileService } from 'common/services/file.service';
import { MessageService } from 'common/services/message.service';
import { IDService } from 'common/services/id.service';
import { DialogService } from './dialog.service';
import { VeronaAPIService } from './verona-api.service';
import { SelectionService } from './selection.service';
import { ElementFactory } from 'common/util/element.factory';
import { ClozeParser } from '../util/cloze-parser';
import { Copy } from 'common/util/copy';
import { UnitFactory } from 'common/util/unit.factory';
import { Page, Section, Unit } from 'common/interfaces/unit';
import {
  ClozeElement, TextImageLabel, DragNDropValueObject,
  DropListElement, InputElement, InputElementValue, LikertElement,
  LikertRowElement, PlayerElement, PlayerProperties,
  PositionedElement, TextElement,
  UIElement, UIElementType
} from 'common/interfaces/elements';
import { ClozeDocument } from 'common/interfaces/cloze';
import { UnitUtils } from 'common/util/unit-utils';
import { ArrayUtils } from 'common/util/array';
import { ClozeUtils } from 'common/util/cloze';
import { SanitizationService } from 'common/services/sanitization.service';

@Injectable({
  providedIn: 'root'
})
export class UnitService {
  unit: Unit;

  elementPropertyUpdated: Subject<void> = new Subject<void>();

  constructor(private selectionService: SelectionService,
              private idService: IDService,
              private veronaApiService: VeronaAPIService,
              private messageService: MessageService,
              private dialogService: DialogService,
              private sanitizationService: SanitizationService,
              private sanitizer: DomSanitizer,
              private translateService: TranslateService) {
    this.unit = UnitFactory.createUnit({} as Unit);
  }

  loadUnitDefinition(unitDefinition: string): void {
    this.idService.reset();
    const unitDef = JSON.parse(unitDefinition);
    if (SanitizationService.isUnitDefinitionOutdated(unitDef)) {
      this.unit = UnitFactory.createUnit(this.sanitizationService.sanitizeUnitDefinition(unitDef));
      this.messageService.showMessage(this.translateService.instant('outdatedUnit'));
    } else {
      this.unit = UnitFactory.createUnit(unitDef);
    }
    this.readIDs(this.unit);
  }

  private readIDs(unit: Unit): void {
    UnitUtils.findUIElements(unit).forEach(element => {
      if (element.type === 'likert') {
        (element as LikertElement).rows.forEach(row => this.idService.addID(row.id));
      }
      if (element.type === 'cloze') {
        ClozeUtils.getClozeChildElements((element as ClozeElement))
          .forEach(child => this.idService.addID(child.id));
      }
      this.idService.addID(element.id);
    });
  }

  unitUpdated(): void {
    this.veronaApiService.sendVoeDefinitionChangedNotification(this.unit);
  }

  addSection(page: Page): void {
    page.sections.push(UnitFactory.createSection());
    this.veronaApiService.sendVoeDefinitionChangedNotification(this.unit);
  }

  deleteSection(section: Section): void {
    this.unit.pages[this.selectionService.selectedPageIndex].sections.splice(
      this.unit.pages[this.selectionService.selectedPageIndex].sections.indexOf(section),
      1
    );
    this.veronaApiService.sendVoeDefinitionChangedNotification(this.unit);
  }

  duplicateSection(section: Section, page: Page, sectionIndex: number): void {
    const newSection: Section = {
      ...section,
      elements: section.elements.map(element => this.duplicateElement(element) as PositionedElement)
    };
    page.sections.splice(sectionIndex + 1, 0, newSection);
    this.veronaApiService.sendVoeDefinitionChangedNotification(this.unit);
  }

  moveSection(section: Section, page: Page, direction: 'up' | 'down'): void {
    ArrayUtils.moveArrayItem(section, page.sections, direction);
    if (direction === 'up' && this.selectionService.selectedPageSectionIndex > 0) {
      this.selectionService.selectedPageSectionIndex -= 1;
    } else if (direction === 'down') {
      this.selectionService.selectedPageSectionIndex += 1;
    }
    this.veronaApiService.sendVoeDefinitionChangedNotification(this.unit);
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
        position: {
          dynamicPositioning: section.dynamicPositioning
        }
      } as unknown as UIElement) as PositionedElement;
    } else {
      newElement = ElementFactory.createElement({
        type: elementType,
        id: this.idService.getNewID(elementType),
        position: {
          dynamicPositioning: section.dynamicPositioning
        }
      } as unknown as UIElement) as PositionedElement;
    }
    if (coordinates && section.dynamicPositioning) {
      newElement.position.gridColumn = coordinates.x;
      newElement.position.gridColumnRange = 1;
      newElement.position.gridRow = coordinates.y;
      newElement.position.gridRowRange = 1;
    } else if (coordinates && !section.dynamicPositioning) {
      newElement.position.xPosition = coordinates.x;
      newElement.position.yPosition = coordinates.y;
    }
    section.elements.push(newElement);
    this.veronaApiService.sendVoeDefinitionChangedNotification(this.unit);
  }

  deleteElements(elements: UIElement[]): void {
    this.freeUpIds(elements);
    this.unit.pages[this.selectionService.selectedPageIndex].sections.forEach(section => {
      section.elements = section.elements.filter(element => !elements.includes(element));
    });
    this.veronaApiService.sendVoeDefinitionChangedNotification(this.unit);
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
    this.veronaApiService.sendVoeDefinitionChangedNotification(this.unit);
  }

  duplicateElementsInSection(elements: UIElement[], pageIndex: number, sectionIndex: number): void {
    const section = this.unit.pages[pageIndex].sections[sectionIndex];
    elements.forEach((element: UIElement) => {
      section.elements.push(this.duplicateElement(element) as PositionedElement);
    });
    this.veronaApiService.sendVoeDefinitionChangedNotification(this.unit);
  }

  private duplicateElement(element: UIElement): UIElement {
    const newElement = JSON.parse(JSON.stringify(element));
    newElement.id = this.idService.getNewID(element.type);
    if (newElement.position) {
      newElement.position.xPosition += 10;
      newElement.position.yPosition += 10;
    }

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
        if (childElement.type === 'drop-list-simple') { // replace value Ids with fresh ones (dropList)
          (childElement.value as DragNDropValueObject[]).forEach((valueObject: DragNDropValueObject) => {
            valueObject.id = this.idService.getNewID('value');
          });
        }
      });
    }
    return newElement;
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
    this.veronaApiService.sendVoeDefinitionChangedNotification(this.unit);
  }

  updateElementProperty(elements: UIElement[],
                        property: string,
                        value: InputElementValue | TextImageLabel | TextImageLabel[] | ClozeDocument |
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
      } else if (element.type === 'likert' && property === 'columns') {
        (element as LikertElement).rows.forEach(row => {
          row.columnCount = (element as LikertElement).columns.length;
        });
      } else if (element.type === 'likert' && property === 'readOnly') {
        (element as LikertElement).rows.forEach(row => {
          row.readOnly = value as boolean;
        });
      } else if (['fixedSize', 'dynamicPositioning', 'xPosition', 'yPosition', 'useMinHeight', 'gridColumn',
        'gridColumnRange', 'gridRow', 'gridRowRange', 'marginLeft', 'marginRight', 'marginTop',
        'marginBottom', 'zIndex'].includes(property)) {
        element.position![property] = Copy.getCopy(value);
      } else if (['fontColor', 'font', 'fontSize', 'lineHeight', 'bold', 'italic', 'underline',
        'backgroundColor', 'borderRadius', 'itemBackgroundColor', 'borderWidth', 'borderColor', 'selectionColor',
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
    this.veronaApiService.sendVoeDefinitionChangedNotification(this.unit);
    return true;
  }


  createLikertRowElement(rowLabelText: string, columnCount: number): LikertRowElement {
    return ElementFactory.createLikertRowElement({
      id: this.idService.getNewID('likert_row'),
      rowLabel: {
        text: rowLabelText,
        imgSrc: null,
        position: 'above'
      },
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
    this.veronaApiService.sendVoeDefinitionChangedNotification(this.unit);
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

  /* Used by props panel to show available dropLists to connect */
  getDropListElementIDs(): string[] {
    return this.unit.pages
      .map(page => page.sections
        .map(section => section.elements
          .reduce((accumulator: any[], currentValue: any) => (
            currentValue.type === 'drop-list' ? accumulator.concat(currentValue.id) : accumulator), [])
          .flat()
        )
        .flat()).flat();
  }
}
