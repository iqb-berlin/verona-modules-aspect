import { Injectable } from '@angular/core';
import { UnitService } from 'editor/src/app/services/unit-services/unit.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { IDService } from 'editor/src/app/services/id.service';
import {
  CompoundElement,
  InputElement, PlayerElement,
  PositionedUIElement,
  UIElement,
  UIElementProperties,
  UIElementType, UIElementValue
} from 'common/models/elements/element';
import { Section } from 'common/models/section';
import { GeometryProperties } from 'common/models/elements/geometry/geometry';
import { firstValueFrom } from 'rxjs';
import { FileService } from 'common/services/file.service';
import { AudioProperties } from 'common/models/elements/media-elements/audio';
import { VideoProperties } from 'common/models/elements/media-elements/video';
import { ImageProperties } from 'common/models/elements/media-elements/image';
import {
  PlayerProperties,
  PositionProperties,
  PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';
import { ElementFactory } from 'common/util/element.factory';
import { ReferenceManager } from 'editor/src/app/services/reference-manager';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { MessageService } from 'common/services/message.service';
import { TextElement } from 'common/models/elements/text/text';
import { ClozeDocument, ClozeElement } from 'common/models/elements/compound-elements/cloze/cloze';
import { DomSanitizer } from '@angular/platform-browser';
import { DragNDropValueObject } from 'common/models/elements/label-interfaces';

@Injectable({
  providedIn: 'root'
})
export class ElementService {
  unit = this.unitService.unit;

  constructor(private unitService: UnitService,
              private selectionService: SelectionService,
              private dialogService: DialogService,
              private messageService: MessageService,
              private idService: IDService,
              private sanitizer: DomSanitizer) { }

  addElementToSectionByIndex(elementType: UIElementType,
                             pageIndex: number,
                             sectionIndex: number): void {
    this.addElementToSection(elementType, this.unit.pages[pageIndex].sections[sectionIndex]);
  }

  async addElementToSection(elementType: UIElementType, section: Section,
                            coordinates?: { x: number, y: number }): Promise<void> {
    const newElementProperties: Partial<UIElementProperties> = {};
    if (['geometry'].includes(elementType)) {
      (newElementProperties as GeometryProperties).appDefinition =
        await firstValueFrom(this.dialogService.showGeogebraAppDefinitionDialog());
      if (!(newElementProperties as GeometryProperties).appDefinition) return; // dialog canceled
    }
    if (['audio', 'video', 'image', 'hotspot-image'].includes(elementType)) {
      let mediaSrc = '';
      switch (elementType) {
        case 'hotspot-image':
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
      (newElementProperties as AudioProperties | VideoProperties | ImageProperties).src = mediaSrc;
    }

    // Coordinates are given if an element is dragged directly into a cell
    if (coordinates) {
      newElementProperties.position = {
        ...(section.dynamicPositioning && { gridColumn: coordinates.x }),
        ...(section.dynamicPositioning && { gridRow: coordinates.y }),
        ...(!section.dynamicPositioning && { yPosition: coordinates.y }),
        ...(!section.dynamicPositioning && { yPosition: coordinates.y })
      } as PositionProperties;
    }

    // Use z-index -1 for frames
    newElementProperties.position = {
      zIndex: elementType === 'frame' ? -1 : 0,
      ...newElementProperties.position
    } as PositionProperties;

    section.addElement(ElementFactory.createElement({
      type: elementType,
      position: PropertyGroupGenerators.generatePositionProps(newElementProperties.position),
      ...newElementProperties,
      id: this.idService.getAndRegisterNewID(elementType)
    }) as PositionedUIElement);
    this.unitService.updateUnitDefinition();
  }

  deleteElements(elements: UIElement[]): void {
    const refs =
      this.unitService.referenceManager.getElementsReferences(elements);
    // console.log('element refs', refs);
    if (refs.length > 0) {
      this.dialogService.showDeleteReferenceDialog(refs)
        .subscribe((result: boolean) => {
          if (result) {
            ReferenceManager.deleteReferences(refs);
            this.unitService.unregisterIDs(elements);
            this.unit.pages[this.selectionService.selectedPageIndex].sections.forEach(section => {
              section.elements = section.elements.filter(element => !elements.includes(element));
            });
            this.unitService.updateUnitDefinition();
          } else {
            this.messageService.showReferencePanel(refs);
          }
        });
    } else {
      this.dialogService.showConfirmDialog('Element(e) löschen?')
        .subscribe((result: boolean) => {
          if (result) {
            this.unitService.unregisterIDs(elements);
            this.unit.pages[this.selectionService.selectedPageIndex].sections.forEach(section => {
              section.elements = section.elements.filter(element => !elements.includes(element));
            });
            this.unitService.updateUnitDefinition();
          }
        });
    }
  }

  updateElementsProperty(elements: UIElement[], property: string, value: unknown): void {
    console.log('updateElementProperty', elements, property, value);
    elements.forEach(element => {
      if (property === 'id') {
        if (this.idService.validateAndAddNewID(value as string, element.id)) {
          element.setProperty('id', value);
        }
      } else if (element.type === 'text' && property === 'text') {
        this.handleTextElementChange(element as TextElement, value as string);
      } else if (property === 'document') {
        this.handleClozeDocumentChange(element as ClozeElement, value as ClozeDocument);
      } else {
        element.setProperty(property, value);
        if (element.type === 'geometry' && property !== 'trackedVariables') this.unitService.geometryElementPropertyUpdated.next(element.id);
        if (element.type === 'math-table') this.unitService.mathTableElementPropertyUpdated.next(element.id);
      }
    });
    this.unitService.elementPropertyUpdated.next();
    this.unitService.updateUnitDefinition();
  }

  private handleTextElementChange(element: TextElement, value: string): void {
    const deletedAnchorIDs = ElementService.getRemovedTextAnchorIDs(element, value);
    const refs = this.unitService.referenceManager.getTextAnchorReferences(deletedAnchorIDs);
    if (refs.length > 0) {
      this.dialogService.showDeleteReferenceDialog(refs)
        .subscribe((result: boolean) => {
          if (result) {
            ReferenceManager.deleteReferences(refs);
            element.setProperty('text', value);
          } else {
            this.messageService.showReferencePanel(refs);
          }
        });
    } else {
      element.setProperty('text', value);
    }
  }

  private handleClozeDocumentChange(element: ClozeElement, newValue: ClozeDocument): void {
    const deletedElements = ElementService.getRemovedClozeElements(element, newValue);
    const refs = this.unitService.referenceManager.getElementsReferences(deletedElements);
    if (refs.length > 0) {
      this.dialogService.showDeleteReferenceDialog(refs)
        .subscribe((result: boolean) => {
          if (result) {
            ReferenceManager.deleteReferences(refs);
            this.applyClozeDocumentChange(element, newValue);
          } else {
            this.messageService.showReferencePanel(refs);
          }
        });
    } else {
      this.applyClozeDocumentChange(element, newValue);
    }
  }

  private applyClozeDocumentChange(element: ClozeElement, value: ClozeDocument): void {
    element.setProperty('document', value);
    ClozeElement.getDocumentChildElements(value as ClozeDocument).forEach(clozeChild => {
      if (clozeChild.id === 'cloze-child-id-placeholder') {
        clozeChild.id = this.idService.getAndRegisterNewID(clozeChild.type);
        delete clozeChild.position;
      }
    });
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
    this.unitService.elementPropertyUpdated.next();
    this.unitService.updateUnitDefinition();
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
        this.dialogService.showPlayerEditDialog(element.id, (element as PlayerElement).player)
          .subscribe((result: PlayerProperties) => {
            if (!result) return;
            Object.keys(result).forEach(
              key => this.updateElementsPlayerProperty([element], key, result[key] as UIElementValue)
            );
          });
        break;
      // no default
    }
  }

  updateSelectedElementsStyleProperty(property: string, value: UIElementValue): void {
    const elements = this.selectionService.getSelectedElements();
    elements.forEach(element => {
      element.setStyleProperty(property, value);
    });
    this.unitService.elementPropertyUpdated.next();
    this.unitService.updateUnitDefinition();
  }

  updateElementsPlayerProperty(elements: UIElement[], property: string, value: UIElementValue): void {
    elements.forEach(element => {
      element.setPlayerProperty(property, value);
    });
    this.unitService.elementPropertyUpdated.next();
    this.unitService.updateUnitDefinition();
  }

  /* - Also changes position of the element to not cover copied element.
     - Also changes and registers all copied IDs. */
  duplicateElement(element: UIElement, adjustPosition: boolean = false): UIElement {
    const newElement = element.getDuplicate();

    if (newElement.position && adjustPosition) {
      newElement.position.xPosition += 10;
      newElement.position.yPosition += 10;
      newElement.position.gridRow = null;
      newElement.position.gridColumn = null;
    }

    newElement.id = this.idService.getAndRegisterNewID(newElement.type);
    if (newElement instanceof CompoundElement) {
      newElement.getChildElements().forEach((child: UIElement) => {
        child.id = this.idService.getAndRegisterNewID(child.type);
        if (child.type === 'drop-list') {
          (child.value as DragNDropValueObject[]).forEach(valueObject => {
            valueObject.id = this.idService.getAndRegisterNewID('value');
          });
        }
      });
    }

    // Special care with DropLists as they are no CompoundElement yet still have children with IDs
    if (newElement.type === 'drop-list') {
      (newElement.value as DragNDropValueObject[]).forEach(valueObject => {
        valueObject.id = this.idService.getAndRegisterNewID('value');
      });
    }
    return newElement;
  }

  static getRemovedTextAnchorIDs(element: TextElement, newValue: string): string[] {
    return TextElement.getAnchorIDs(element.text)
      .filter(el => !TextElement.getAnchorIDs(newValue).includes(el));
  }

  static getRemovedClozeElements(cloze: ClozeElement, newClozeDoc: ClozeDocument): UIElement[] {
    const newElements = ClozeElement.getDocumentChildElements(newClozeDoc);
    return cloze.getChildElements()
      .filter(element => !newElements.includes(element));
  }

  updateSelectedElementsPositionProperty(property: string, value: UIElementValue): void {
    this.updateElementsPositionProperty(this.selectionService.getSelectedElements(), property, value);
  }

  updateElementsPositionProperty(elements: UIElement[], property: string, value: UIElementValue): void {
    elements.forEach(element => {
      element.setPositionProperty(property, value);
    });
    this.reorderElements();
    this.unitService.elementPropertyUpdated.next();
    this.unitService.updateUnitDefinition();
  }

  updateElementsDimensionsProperty(elements: UIElement[], property: string, value: number | null): void {
    console.log('updateElementsDimensionsProperty', property, value);
    elements.forEach(element => {
      element.setDimensionsProperty(property, value);
    });
    this.unitService.elementPropertyUpdated.next();
    this.unitService.updateUnitDefinition();
  }

  /* Reorder elements by their position properties, so the tab order is correct */
  reorderElements() {
    const sectionElementList = this.unit.pages[this.selectionService.selectedPageIndex]
      .sections[this.selectionService.selectedPageSectionIndex].elements;
    const isDynamicPositioning = this.unit.pages[this.selectionService.selectedPageIndex]
      .sections[this.selectionService.selectedPageSectionIndex].dynamicPositioning;
    const sortDynamicPositioning = (a: PositionedUIElement, b: PositionedUIElement) => {
      const rowSort =
        (a.position.gridRow !== null ? a.position.gridRow : Infinity) -
        (b.position.gridRow !== null ? b.position.gridRow : Infinity);
      if (rowSort === 0) {
        return a.position.gridColumn! - b.position.gridColumn!;
      }
      return rowSort;
    };
    const sortStaticPositioning = (a: PositionedUIElement, b: PositionedUIElement) => {
      const ySort = a.position.yPosition! - b.position.yPosition!;
      if (ySort === 0) {
        return a.position.xPosition! - b.position.xPosition!;
      }
      return ySort;
    };
    if (isDynamicPositioning) {
      sectionElementList.sort(sortDynamicPositioning);
    } else {
      sectionElementList.sort(sortStaticPositioning);
    }
  }
}
