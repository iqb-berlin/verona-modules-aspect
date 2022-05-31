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
import { UnitUtils } from 'common/util/unit-utils';
import { ArrayUtils } from 'common/util/array';
import { SanitizationService } from 'common/services/sanitization.service';
import { Unit } from 'common/models/unit';
import {
  DragNDropValueObject,
  InputElement,
  InputElementValue, PlayerElement, PlayerProperties, PositionedUIElement, TextImageLabel,
  UIElement, UIElementType
} from 'common/models/elements/element';
import { LikertElement } from 'common/models/elements/compound-elements/likert/likert';
import { ClozeDocument, ClozeElement } from 'common/models/elements/compound-elements/cloze/cloze';
import { LikertRowElement } from 'common/models/elements/compound-elements/likert/likert-row';
import { TextElement } from 'common/models/elements/text/text';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import { Page } from 'common/models/page';
import { Section } from 'common/models/section';

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
    this.unit = new Unit();
  }

  loadUnitDefinition(unitDefinition: string): void {
    this.idService.reset();
    const unitDef = JSON.parse(unitDefinition);
    if (SanitizationService.isUnitDefinitionOutdated(unitDef)) {
      // this.unit = UnitFactory.createUnit(this.sanitizationService.sanitizeUnitDefinition(unitDef));
      this.unit = new Unit(this.sanitizationService.sanitizeUnitDefinition(unitDef));
      this.messageService.showMessage(this.translateService.instant('outdatedUnit'));
    } else {
      this.unit = new Unit(unitDef);
    }
    this.readIDs(this.unit);
  }

  private readIDs(unit: Unit): void {
    UnitUtils.findUIElements(unit).forEach(element => {
      if (element.type === 'likert') {
        (element as LikertElement).getChildElements().forEach(row => this.idService.addID(row.id));
      }
      if (element.type === 'cloze') {
        (element as ClozeElement).getChildElements()
          .forEach(child => this.idService.addID(child.id));
      }
      this.idService.addID(element.id);
    });
  }

  unitUpdated(): void {
    this.sendChangedNotifications();
  }

  addSection(page: Page): void {
    page.sections.push(new Section());
    this.sendChangedNotifications();
  }

  deleteSection(section: Section): void {
    this.unit.pages[this.selectionService.selectedPageIndex].sections.splice(
      this.unit.pages[this.selectionService.selectedPageIndex].sections.indexOf(section),
      1
    );
    this.sendChangedNotifications();
  }

  duplicateSection(section: Section, page: Page, sectionIndex: number): void {
    const newSection: Section = new Section({
      ...section,
      elements: section.elements.map(element => this.duplicateElement(element) as PositionedUIElement)
    });
    page.sections.splice(sectionIndex + 1, 0, newSection);
    this.sendChangedNotifications();
  }

  moveSection(section: Section, page: Page, direction: 'up' | 'down'): void {
    ArrayUtils.moveArrayItem(section, page.sections, direction);
    if (direction === 'up' && this.selectionService.selectedPageSectionIndex > 0) {
      this.selectionService.selectedPageSectionIndex -= 1;
    } else if (direction === 'down') {
      this.selectionService.selectedPageSectionIndex += 1;
    }
    this.sendChangedNotifications();
  }

  addElementToSectionByIndex(elementType: UIElementType,
                             pageIndex: number,
                             sectionIndex: number): void {
    this.addElementToSection(elementType, this.unit.pages[pageIndex].sections[sectionIndex]);
  }

  async addElementToSection(elementType: UIElementType,
                            section: Section,
                            coordinates?: { x: number, y: number }): Promise<void> {
    console.log('addElementToSection', elementType);
    let newElement: PositionedUIElement;
    // TODO: Remove switch use parameter for loadFile
    if (['audio', 'video', 'image'].includes(elementType)) {
      // TODO: loadFile before addElementToSection
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
      // TODO: ElementFactory.createElement is used 2 times
      newElement = ElementFactory.createElement(
        elementType, {
          id: this.idService.getNewID(elementType),
          src: mediaSrc,
          position: {
            dynamicPositioning: section.dynamicPositioning
          }
        } as unknown as UIElement) as PositionedUIElement;
    } else {
      newElement = ElementFactory.createElement(
        elementType, {
          id: this.idService.getNewID(elementType),
          position: {
            dynamicPositioning: section.dynamicPositioning
          }
        } as unknown as UIElement) as PositionedUIElement;
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
    this.sendChangedNotifications();
  }

  deleteElements(elements: UIElement[]): void {
    this.freeUpIds(elements);
    this.unit.pages[this.selectionService.selectedPageIndex].sections.forEach(section => {
      section.elements = section.elements.filter(element => !elements.includes(element));
    });
    this.sendChangedNotifications();
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
      newSection.elements.push(element as PositionedUIElement);
      (element as PositionedUIElement).position.dynamicPositioning = newSection.dynamicPositioning;
    });
    this.sendChangedNotifications();
  }

  duplicateElementsInSection(elements: UIElement[], pageIndex: number, sectionIndex: number): void {
    const section = this.unit.pages[pageIndex].sections[sectionIndex];
    elements.forEach((element: UIElement) => {
      section.elements.push(this.duplicateElement(element) as PositionedUIElement);
    });
    this.sendChangedNotifications();
  }

  private duplicateElement(element: UIElement): UIElement {
    const newElement = ElementFactory
      .createElement(element.type, { ...element, id: this.idService.getNewID(element.type) });
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
      element.getChildElements().forEach((childElement: InputElement) => {
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
      section.elements.forEach((element: UIElement) => {
        (element as PositionedUIElement).position.dynamicPositioning = value as boolean;
      });
    } else {
      // section[property] = value;
      section.setProperty(property, value);
    }
    this.elementPropertyUpdated.next();
    this.sendChangedNotifications();
  }

  updateElementsProperty(elements: UIElement[],
                         property: string,
                         value: InputElementValue | TextImageLabel | TextImageLabel[] | ClozeDocument |
                         DragNDropValueObject[] | null): void {
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
      } else {
        element.setProperty(property, value);
      }
    });
    this.elementPropertyUpdated.next();
    this.sendChangedNotifications();
  }

  updateSelectedElementsPositionProperty(property: string, value: any): void {
    this.updateElementsPositionProperty(this.selectionService.getSelectedElements(), property, value);
  }

  updateElementsPositionProperty(elements: UIElement[], property: string, value: any): void {
    elements.forEach(element => {
      element.setPositionProperty(property, value);
    });
    this.elementPropertyUpdated.next();
    this.sendChangedNotifications();
  }

  updateSelectedElementsStyleProperty(property: string, value: any): void {
    const elements = this.selectionService.getSelectedElements();
    elements.forEach(element => {
      element.setStyleProperty(property, value);
    });
    this.elementPropertyUpdated.next();
    this.sendChangedNotifications();
  }

  updateElementsPlayerProperty(elements: UIElement[], property: string, value: any): void {
    elements.forEach(element => {
      element.setPlayerProperty(property, value);
    });
    this.elementPropertyUpdated.next();
    this.sendChangedNotifications();
  }

  createLikertRowElement(rowLabelText: string, columnCount: number): LikertRowElement {
    return new LikertRowElement({
      id: this.idService.getNewID('likert_row'),
      rowLabel: {
        text: rowLabelText,
        imgSrc: null,
        position: 'above'
      },
      columnCount: columnCount
    } as Partial<LikertRowElement>);
  }

  alignElements(elements: PositionedUIElement[], alignmentDirection: 'left' | 'right' | 'top' | 'bottom'): void {
    switch (alignmentDirection) {
      case 'left':
        this.updateElementsProperty(
          elements,
          'xPosition',
          Math.min(...elements.map(element => element.position.xPosition))
        );
        break;
      case 'right':
        this.updateElementsProperty(
          elements,
          'xPosition',
          Math.max(...elements.map(element => element.position.xPosition))
        );
        break;
      case 'top':
        this.updateElementsProperty(
          elements,
          'yPosition',
          Math.min(...elements.map(element => element.position.yPosition))
        );
        break;
      case 'bottom':
        this.updateElementsProperty(
          elements,
          'yPosition',
          Math.max(...elements.map(element => element.position.yPosition))
        );
        break;
      // no default
    }
    this.elementPropertyUpdated.next();
    this.sendChangedNotifications();
  }

  sendChangedNotifications(): void {
    // stattdessen event emitten?
    this.veronaApiService.sendVoeDefinitionChangedNotification(this.unit);

    // relevante schemer Data ermitteln
    const schemerData = UnitUtils.findUIElements(this.unit.pages)
      .filter(element => element.getSchemerData)
      .map(element  => this.getSchemerOption(element.type) ?
        element.getSchemerData(this.getSchemerOption(element.type)) :
        element.getSchemerData()
      )
      .filter(data => data.values.length || !data.valuesComplete); // schemerData mit leeren values sind nicht von interesse
    console.log(schemerData);
  }

  // Values für Schemer elemente setzen? Sind nur Droplists dynamisch?
  private getSchemerOption(type: UIElementType): any {
    if (type === 'drop-list-simple' || type === 'drop-list') {
      return UnitUtils
        .findUIElements(this.unit.pages, 'drop-list')
        .concat(UnitUtils.findUIElements(this.unit.pages, 'drop-list-simple'));
    }
    return null;
  }


  saveUnit(): void {
    FileService.saveUnitToFile(JSON.stringify(this.unit));
  }

  async loadUnitFromFile(): Promise<void> {
    this.loadUnitDefinition(await FileService.loadFile(['.json']));
  }

  // TODO: showDefaultEditDialog is method in unitService?
  showDefaultEditDialog(element: UIElement): void {
    switch (element.type) {
      case 'button':
      case 'dropdown':
      case 'checkbox':
      case 'radio':
        this.dialogService.showTextEditDialog(element.label as string).subscribe((result: string) => {
          if (result) {
            this.updateElementsProperty([element], 'label', result);
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
            this.updateElementsProperty(
              [element],
              'text',
              (this.sanitizer.bypassSecurityTrustHtml(result) as any).changingThisBreaksApplicationSecurity as string
            );
          }
        });
        break;
      case 'cloze':
        this.dialogService.showClozeTextEditDialog(
          (element as ClozeElement).document!,
          (element as ClozeElement).styling.fontSize
        ).subscribe((result: string) => {
          if (result) {
            // TODO add proper sanitization
            this.updateElementsProperty(
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
              this.updateElementsProperty([element], 'value', result);
            }
          });
        break;
      case 'text-area':
        this.dialogService.showMultilineTextEditDialog((element as InputElement).value as string)
          .subscribe((result: string) => {
            if (result) {
              this.updateElementsProperty([element], 'value', result);
            }
          });
        break;
      case 'audio':
      case 'video':
        this.dialogService.showPlayerEditDialog((element as PlayerElement).player)
          .subscribe((result: PlayerProperties) => {
            Object.keys(result).forEach(key => this.updateElementsPlayerProperty([element], key, result[key]));
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
    // TODO: DropListSinple?
    return this.unit.pages
      .map(page => page.sections
        .map(section => section.elements
          .reduce((accumulator: any[], currentValue: any) => (
            currentValue.type === 'drop-list' ? accumulator.concat(currentValue.id) : accumulator), [])
          .flat()
        )
        .flat()).flat();
  }

  replaceSection(pageIndex: number, sectionIndex: number, newSection: Section): void {
    this.unit.pages[pageIndex].sections[sectionIndex] = newSection;
  }
}
