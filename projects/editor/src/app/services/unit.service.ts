import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { FileService } from 'common/services/file.service';
import { MessageService } from 'common/services/message.service';
import { DialogService } from './dialog.service';
import { VeronaAPIService } from './verona-api.service';
import { SelectionService } from './selection.service';
import { ArrayUtils } from 'common/util/array';
import { SanitizationService } from 'common/services/sanitization.service';
import { Unit } from 'common/models/unit';
import {
  DragNDropValueObject, InputElement,
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
import { ElementFactory } from 'common/util/element.factory';
import { IDManager } from 'common/util/id-manager';

@Injectable({
  providedIn: 'root'
})
export class UnitService {
  unit: Unit;

  elementPropertyUpdated: Subject<void> = new Subject<void>();

  constructor(private selectionService: SelectionService,
              private veronaApiService: VeronaAPIService,
              private messageService: MessageService,
              private dialogService: DialogService,
              private sanitizationService: SanitizationService,
              private sanitizer: DomSanitizer,
              private translateService: TranslateService) {
    this.unit = new Unit();
  }

  loadUnitDefinition(unitDefinition: string): void {
    IDManager.getInstance().reset();
    const unitDef = JSON.parse(unitDefinition);
    if (SanitizationService.isUnitDefinitionOutdated(unitDef)) {
      this.unit = new Unit(this.sanitizationService.sanitizeUnitDefinition(unitDef));
      this.messageService.showMessage(this.translateService.instant('outdatedUnit'));
    } else {
      this.unit = new Unit(unitDef, IDManager.getInstance());
    }
  }

  unitUpdated(): void {
    this.veronaApiService.sendVoeDefinitionChangedNotification(this.unit);
  }

  addSection(page: Page, newSection?: Partial<Section>): void {
    page.sections.push(new Section(newSection, IDManager.getInstance()));
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
    const newSection: Section = new Section({
      ...section,
      elements: section.elements.map(element => this.duplicateElement(element) as PositionedUIElement)
    });
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
    const newElement: { type: string } & Partial<PositionedUIElement> = {
      type: elementType
    };
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
      newElement.src = mediaSrc;
    }

    if (coordinates) {
      newElement.position = ElementFactory.initPositionProps({
        ...(section.dynamicPositioning && { gridColumn: coordinates.x }),
        ...(section.dynamicPositioning && { gridRow: coordinates.y }),
        ...(!section.dynamicPositioning && { yPosition: coordinates.y }),
        ...(!section.dynamicPositioning && { yPosition: coordinates.y })
      });
    }
    section.addElement(Section.createElement(newElement, IDManager.getInstance()));
    this.veronaApiService.sendVoeDefinitionChangedNotification(this.unit);
  }

  deleteElements(elements: UIElement[]): void {
    this.freeUpIds(elements);
    this.unit.pages[this.selectionService.selectedPageIndex].sections.forEach(section => {
      section.elements = section.elements.filter(element => !elements.includes(element));
    });
    this.veronaApiService.sendVoeDefinitionChangedNotification(this.unit);
  }

  private freeUpIds(elements: UIElement[]): void { // TODO free up child and value IDs
    elements.forEach(element => {
      if (element.type === 'drop-list') {
        ((element as DropListElement).value as DragNDropValueObject[]).forEach((value: DragNDropValueObject) => {
          IDManager.getInstance().removeId(value.id);
        });
      }
      IDManager.getInstance().removeId(element.id);
    });
  }

  /* Move element between sections */
  transferElement(elements: UIElement[], previousSection: Section, newSection: Section): void {
    previousSection.elements = previousSection.elements.filter(element => !elements.includes(element));
    elements.forEach(element => {
      newSection.elements.push(element as PositionedUIElement);
      (element as PositionedUIElement).position.dynamicPositioning = newSection.dynamicPositioning;
    });
    this.veronaApiService.sendVoeDefinitionChangedNotification(this.unit);
  }

  duplicateElementsInSection(elements: UIElement[], pageIndex: number, sectionIndex: number): void {
    const section = this.unit.pages[pageIndex].sections[sectionIndex];
    elements.forEach((element: UIElement) => {
      section.elements.push(this.duplicateElement(element) as PositionedUIElement);
    });
    this.veronaApiService.sendVoeDefinitionChangedNotification(this.unit);
  }

  private duplicateElement(element: UIElement): UIElement {
    const newElement = Section.createElement(element, IDManager.getInstance());
    if (newElement.position) {
      newElement.position.xPosition += 10;
      newElement.position.yPosition += 10;
    }

    if ('value' in newElement && newElement.value instanceof Object) { // replace value Ids with fresh ones (dropList)
      (newElement.value as DragNDropValueObject[]).forEach((valueObject: { id: string }) => {
        valueObject.id = IDManager.getInstance().getNewID('value');
      });
    }

    if ('row' in newElement && newElement.rows instanceof Object) { // replace row Ids with fresh ones (likert)
      (newElement.rows as LikertRowElement[]).forEach((rowObject: { id: string }) => {
        rowObject.id = IDManager.getInstance().getNewID('likert_row');
      });
    }


    if (newElement instanceof ClozeElement) {
      element.getChildElements().forEach((childElement: UIElement) => {
        childElement.id = IDManager.getInstance().getNewID(childElement.type);
        if (childElement.type === 'drop-list-simple') { // replace value Ids with fresh ones (dropList)
          (childElement.value as DragNDropValueObject[]).forEach((valueObject: DragNDropValueObject) => {
            valueObject.id = IDManager.getInstance().getNewID('value');
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
      section.setProperty(property, value);
    }
    this.elementPropertyUpdated.next();
    this.veronaApiService.sendVoeDefinitionChangedNotification(this.unit);
  }

  updateElementsProperty(elements: UIElement[],
                         property: string,
                         value: InputElementValue | TextImageLabel | TextImageLabel[] | ClozeDocument |
                         DragNDropValueObject[] | null): void {
    console.log('updateElementProperty', elements, property, value);
    elements.forEach(element => {
      if (property === 'id') {
        if (!IDManager.getInstance().isIdAvailable((value as string))) { // prohibit existing IDs
          this.messageService.showError(this.translateService.instant('idTaken'));
        } else {
          IDManager.getInstance().removeId(element.id);
          IDManager.getInstance().addID(value as string);
          element.id = value as string;
        }
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
    this.veronaApiService.sendVoeDefinitionChangedNotification(this.unit);
  }

  updateSelectedElementsPositionProperty(property: string, value: any): void {
    this.updateElementsPositionProperty(this.selectionService.getSelectedElements(), property, value);
  }

  updateElementsPositionProperty(elements: UIElement[], property: string, value: any): void {
    elements.forEach(element => {
      element.setPositionProperty(property, value);
    });
    this.elementPropertyUpdated.next();
    this.veronaApiService.sendVoeDefinitionChangedNotification(this.unit);
  }

  updateSelectedElementsStyleProperty(property: string, value: any): void {
    const elements = this.selectionService.getSelectedElements();
    elements.forEach(element => {
      element.setStyleProperty(property, value);
    });
    this.elementPropertyUpdated.next();
    this.veronaApiService.sendVoeDefinitionChangedNotification(this.unit);
  }

  updateElementsPlayerProperty(elements: UIElement[], property: string, value: any): void {
    elements.forEach(element => {
      element.setPlayerProperty(property, value);
    });
    this.elementPropertyUpdated.next();
    this.veronaApiService.sendVoeDefinitionChangedNotification(this.unit);
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
    return IDManager.getInstance().getNewID('value');
  }

  /* Used by props panel to show available dropLists to connect */
  getDropListElementIDs(): string[] {
    const allDropLists = [
      ...this.unit.getAllElements('drop-list'),
      ...this.unit.getAllElements('drop-list-simple')];
    return allDropLists.map(dropList => dropList.id);
  }

  replaceSection(pageIndex: number, sectionIndex: number, newSection: Section): void {
    this.deleteSection(this.unit.pages[pageIndex].sections[sectionIndex]);
    this.addSection(this.unit.pages[pageIndex], newSection);
  }
}
