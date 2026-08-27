import { Injectable } from '@angular/core';
import { UnitService } from 'editor/src/app/services/unit.service';
import { copyPlainData } from 'editor/src/app/utils/copy-plain-data';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { IDService } from 'editor/src/app/services/id.service';
import {
  InputElement, PlayerElement,
  UIElement
} from 'common/models/elements/element';
import { Section } from 'common/models/section';
import { GeometryProperties } from 'common/models/elements/geometry';
import { firstValueFrom } from 'rxjs';
import { FileService } from 'common/services/file.service';
import { AudioProperties } from 'common/models/elements/audio';
import { VideoProperties } from 'common/models/elements/video';
import { ImageProperties } from 'common/models/elements/image';
import {
  DimensionProperties,
  OwnProperty,
  PlayerProperties,
  PositionProperties,
  Stylings
} from 'common/models/elements/property-group-interfaces';
import { ElementFactory } from 'common/utils/element-factory';
import { ReferenceManager } from 'editor/src/app/classes/reference-manager';
import { DialogService } from 'editor/src/app/services/dialog.service';
import {
  TableEditResult
} from 'editor/src/app/components/dialogs/table-edit-dialog/table-edit-dialog.component';
import { MessageService } from 'editor/src/app/services/message.service';
import { TextElement } from 'common/models/elements/text';
import { ClozeDocument, ClozeElement } from 'common/models/elements/cloze';
import { TranslateService } from '@ngx-translate/core';
import { DialogCanceledError } from 'editor/src/app/classes/dialog-canceled-error';
import { TableElement } from 'common/models/elements/table';
import { DragNDropValueObject } from 'common/models/label-interfaces';
import {
  PositionedUIElement,
  UIElementDraft,
  UIElementType,
  UIElementValue
} from 'common/models/ui-element-interfaces';
import { DropListElement } from 'common/models/elements/drop-list';
import {
  LikertRowElement, LikertRowProperties
} from 'common/models/elements/likert-row';

/* What is collected for an element that is about to be created, without the type the caller already
   knows: the groups stay partial, because the factory completes them from the element's defaults. */
type PreparedElementProps = Omit<UIElementDraft, 'type'>;

@Injectable({
  providedIn: 'root'
})
export class ElementService {
  constructor(private unitService: UnitService,
              private selectionService: SelectionService,
              private dialogService: DialogService,
              private messageService: MessageService,
              private idService: IDService,
              private translateService: TranslateService) { }

  async addElementToSection(elementType: UIElementType, sectionParam?: Section,
                            coordinates?: { x: number, y: number }): Promise<void> {
    const section = sectionParam || this.unitService.getSelectedSection();
    let newElementProperties: PreparedElementProps;
    try {
      newElementProperties = await this.prepareElementProps(elementType, section, coordinates);
    } catch (e) {
      /* Nothing is added when the preparation did not finish. A cancelled dialog is the user's own
         decision and says so by itself; a file that could not be read has to be reported, or the
         element the user asked for is simply absent. Before #1296 the element was added either way,
         with neither `src` nor `fileName` -- silently, and to be deleted before the import could be
         tried again. */
      if (!(e instanceof DialogCanceledError)) {
        this.messageService.showError(this.translateService.instant('elementNotAddedFileFailed'));
      }
      return;
    }
    /* The position prepared above is handed on as the partial it is: the factory normalizes, and the
       normalizer builds the group from the element's own defaults plus the members named there -- a
       grid cell, absolute coordinates, the frame's zIndex (#1193). */
    section.addElement(ElementFactory.createElement({
      type: elementType,
      ...newElementProperties
    }, this.idService) as PositionedUIElement);
    this.unitService.updateUnitDefinition();
  }

  private async prepareElementProps(elementType: UIElementType,
                                    section: Section,
                                    coordinates?: { x: number, y: number }): Promise<PreparedElementProps> {
    const newElementProperties: PreparedElementProps = {};

    switch (elementType) {
      case 'geometry': {
        const geogebraInfo = await firstValueFrom(this.dialogService.showGeogebraAppDefinitionDialog());
        /* Asked of the dialog's answer, not of the property it would have filled: a cancelled dialog
           answers with nothing at all, and reading a field of it threw a TypeError -- which the caller
           now reports as a failed file import (#1296). */
        if (!geogebraInfo?.content) return Promise.reject(new DialogCanceledError());
        (newElementProperties as GeometryProperties).appDefinition = geogebraInfo.content;
        (newElementProperties as GeometryProperties).fileName = geogebraInfo.name;
        break;
      }
      case 'audio':
        await FileService.loadAudio().then(audio => {
          (newElementProperties as AudioProperties).src = audio.content;
          (newElementProperties as AudioProperties).fileName = audio.name;
        });
        break;
      case 'video':
        await FileService.loadVideo().then(video => {
          (newElementProperties as VideoProperties).src = video.content;
          (newElementProperties as VideoProperties).fileName = video.name;
        });
        break;
      case 'image':
      case 'hotspot-image': {
        const file = await FileService.getRawFile('image/*');
        const base64 = await FileService.readFileAsText(file, true);
        if (FileService.isResizable(file.type)) {
          const options = await firstValueFrom(this.dialogService.showImageResizeDialog(base64, {}));
          if (!options) return Promise.reject(new DialogCanceledError());
          (newElementProperties as ImageProperties).src = await FileService.scaleImage(base64, options);
        } else {
          (newElementProperties as ImageProperties).src = base64;
        }
        (newElementProperties as ImageProperties).fileName = file.name;
        break;
      }
      case 'frame':
        newElementProperties.position = {
          zIndex: -1,
          ...newElementProperties.position
        };
        break;
      // no default
    }

    /* Coordinates are given if an element is dragged directly onto the canvas.
       x and y have different meaning depending on the layouting of the section, being either absolute
       or grid coordinates. */
    if (section.dynamicPositioning) {
      newElementProperties.position = {
        gridRow: coordinates ? coordinates.x : section.getLastRowIndex() + 1,
        gridColumn: coordinates ? coordinates.y : 1,
        ...newElementProperties.position
      };
    } else {
      newElementProperties.position = {
        xPosition: coordinates ? coordinates.x : 0,
        yPosition: coordinates ? coordinates.y : 0,
        ...newElementProperties.position
      };
    }
    return newElementProperties;
  }

  createLikertRowElement(props: LikertRowProperties): LikertRowElement {
    return ElementFactory.createElement(props, this.idService) as LikertRowElement;
  }

  /* Only what a section holds itself can be deleted here. A child of a compound element -- a cloze
     gap, a table cell -- lives in the list of its parent and goes through the parent's edit dialog;
     the unit cannot take it out, and releasing its ID all the same handed the same ID to the next
     element that asked for one (#1262). Asking about it first is no better: the confirmation would
     name an element that stays. The keyboard reaches this with a child in the selection because the
     click that selects a child leaves the focus on the overlay of its parent.
     What is released and unselected afterwards is what the unit reports as gone, plus the children
     that went with it: `unregisterIDs()` covers one element, and no overlay of a deleted compound is
     left to take its children out of the selection (#1258). */
  async deleteElements(elements: UIElement[]): Promise<void> {
    const sectionElements = this.unitService.unit.pages
      .flatMap(page => page.sections)
      .flatMap(section => section.elements);
    const deletableElements = elements.filter(element => sectionElements.includes(element));
    if (deletableElements.length === 0) return;
    if (await this.unitService.prepareDelete('elements', deletableElements)) {
      const goneElements = this.unitService.unit.deleteElements(deletableElements)
        .flatMap(element => [element, ...element.getChildElements()]);
      goneElements.forEach(el => el.unregisterIDs());
      /* Whatever else is selected stays selected -- the overview dialog deletes elements the user is
         not working on (#1258). */
      this.selectionService.deselectElements(goneElements);
      this.unitService.updateUnitDefinition();
    }
  }

  /*
   * `OwnProperty` rejects a named property that belongs to the position, dimensions or styling
   * group: those have their own update methods, and going through this one puts the value on the
   * element root instead, where nothing reads it. Names arriving as a plain string from the panel's
   * relay chain still pass - see the type for why that is the useful trade.
   */
  updateElementsProperty<K extends string>(elements: UIElement[],
                                           property: K & OwnProperty<K>,
                                           value: UIElementValue): void {
    // console.log('updateElementsProperty ', elements, property, value);
    let hasDirectWrite = false;
    elements.forEach(element => {
      if (element.type === 'text' && property === 'text') {
        this.handleTextElementChange(element as TextElement, value as string);
      } else if (property === 'document') {
        this.handleClozeDocumentChange(element as ClozeElement, value as ClozeDocument);
      } else {
        /* Its own copy for every element: `setProperty` splices the value's entries into each of
           them, so one value handed to a selection would leave them all holding the same objects --
           editing a label on one would change it on the others (#1188). */
        element.setProperty(property, copyPlainData(value));
        if (element.type === 'geometry' && property !== 'trackedVariables' && property !== 'trackedExpectedVariables') {
          this.unitService.geometryElementPropertyUpdated.next(element.id);
        }
        if (element.type === 'math-table') this.unitService.mathTableElementPropertyUpdated.next(element.id);
        if (element.type === 'table') this.unitService.tablePropUpdated.next(element.id);
        hasDirectWrite = true;
      }
    });
    if (hasDirectWrite) this.reportPropertyUpdate();
  }

  /* The report belongs where the value is written. Text and cloze documents can take a detour through
     the reference dialog, whose answer arrives later -- a report sent while it is still open carries
     the value the element had before, and the confirmed change then reaches the host only with some
     later, unrelated edit; a save in between writes the stale state (#1269). Both writers report for
     themselves, the loop reports for the properties it writes itself, and a declined dialog writes
     nothing and reports nothing. */
  private reportPropertyUpdate(): void {
    this.unitService.elementPropertyUpdated.next();
    this.unitService.updateUnitDefinition();
  }

  updateDropListValueObject(valueIndex: number, value: DragNDropValueObject): void {
    const selectedElements = this.selectionService.getSelectedElements() as DropListElement[];
    selectedElements.forEach(el => el.updateValueObject(valueIndex, value));
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
            this.reportPropertyUpdate();
          } else {
            this.messageService.showReferencePanel(refs);
          }
        });
    } else {
      element.setProperty('text', value);
      this.reportPropertyUpdate();
    }
  }

  private handleClozeDocumentChange(element: ClozeElement, newValue: ClozeDocument): void {
    const deletedElements = element.getRemovedClozeElements(newValue);
    const refs = this.unitService.referenceManager.getElementsReferences(deletedElements);
    if (refs.length > 0) {
      this.dialogService.showDeleteReferenceDialog(refs)
        .subscribe((result: boolean) => {
          if (result) {
            ReferenceManager.deleteReferences(refs);
            this.setClozeDocument(element, newValue, deletedElements);
          } else {
            this.messageService.showReferencePanel(refs);
          }
        });
    } else {
      this.setClozeDocument(element, newValue, deletedElements);
    }
  }

  /* A gap the user removed in the rich text editor leaves the unit with the document: the model
     drops it and releases its IDs. Its overlay goes with the node it sat in, and no overlay is
     rebuilt, so nothing takes it out of the selection -- the properties panel would go on offering
     the controls of a child that is not in the unit any more (#1261, the symptom of #1258 reached
     through the cloze editor). The deselection belongs here and not in ClozeElement.setProperty:
     the model lives in common/ and knows no SelectionService. */
  private setClozeDocument(element: ClozeElement, newValue: ClozeDocument, deletedElements: UIElement[]): void {
    element.setProperty('document', newValue);
    this.selectionService.deselectElements(deletedElements);
    this.reportPropertyUpdate();
  }

  /**
   * xPosition and yPosition live in the element's position group, so they have to go through
   * updateElementsPositionProperty. updateElementsProperty would end up in UIElement.setProperty,
   * which writes this[property] - allowed by the index signature, but it puts a stray xPosition on
   * the element itself and leaves position.xPosition alone, so alignment did nothing at all.
   */
  alignElements(elements: PositionedUIElement[], alignmentDirection: 'left' | 'right' | 'top' | 'bottom'): void {
    switch (alignmentDirection) {
      case 'left':
        this.updateElementsPositionProperty(
          elements,
          'xPosition',
          Math.min(...elements.map(element => element.position.xPosition))
        );
        break;
      case 'right':
        this.updateElementsPositionProperty(
          elements,
          'xPosition',
          Math.max(...elements.map(element => element.position.xPosition))
        );
        break;
      case 'top':
        this.updateElementsPositionProperty(
          elements,
          'yPosition',
          Math.min(...elements.map(element => element.position.yPosition))
        );
        break;
      case 'bottom':
        this.updateElementsPositionProperty(
          elements,
          'yPosition',
          Math.max(...elements.map(element => element.position.yPosition))
        );
        break;
      // no default
    }
  }

  showDefaultEditDialog(elementParam?: UIElement): void {
    const element = elementParam || this.selectionService.getSelectedElements()[0];
    switch (element.type) {
      case 'button':
      case 'dropdown':
      case 'checkbox':
        if (element.imgSrc) break; // Do nothing if image is set, as changing the image is not possible
      // eslint-disable-next-line no-fallthrough
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
            this.updateElementsProperty([element], 'text', result);
          }
        });
        break;
      case 'cloze':
        this.dialogService.showClozeTextEditDialog(
          (element as ClozeElement).document,
          (element as ClozeElement).styling.fontSize
        ).subscribe((result: ClozeDocument | undefined) => {
          if (result) {
            // TODO add proper sanitization
            this.updateElementsProperty([element], 'document', result);
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
        if (this.unitService.expertMode) {
          this.dialogService.showPlayerEditDialog(element.id, (element as PlayerElement).player)
            .subscribe((result: PlayerProperties) => {
              if (!result) return;
              // Object.keys widens to string[]; result is a PlayerProperties, so its keys are its own.
              (Object.keys(result) as (keyof PlayerProperties)[]).forEach(
                key => this.updateElementsPlayerProperty([element], key, result[key] as UIElementValue)
              );
            });
        }
        break;
      case 'table':
        this.dialogService.showTableEditDialog(element as TableElement)
          .subscribe((result: TableEditResult | undefined) => {
            if (result) {
              this.updateElementsProperty([element], 'elements', result.elements);
              this.updateElementsProperty([element], 'headerRows', result.headerRows);
            }
          });
        break;
      // no default
    }
  }

  updateSelectedElementsStyleProperty(property: keyof Stylings, value: UIElementValue): void {
    const elements = this.selectionService.getSelectedElements();
    elements.forEach(element => {
      element.setStyleProperty(property, value);
    });
    this.unitService.elementPropertyUpdated.next();
    this.unitService.updateUnitDefinition();
  }

  updateElementsPlayerProperty(elements: UIElement[],
                               property: keyof PlayerProperties,
                               value: UIElementValue): void {
    elements.forEach(element => {
      element.setPlayerProperty(property, value);
    });
    this.unitService.elementPropertyUpdated.next();
    this.unitService.updateUnitDefinition();
  }

  /* Each copy goes into the section that holds its original, looked up in the unit rather than read
     from selectedPageIndex/selectedSectionIndex: those can name another section, and the copy then
     lands there without anything going wrong visibly (#1204). */
  duplicateSelectedElements(): void {
    this.selectionService.getSelectedElements().forEach((element: UIElement) => {
      const section = this.unitService.unit.getSectionOfElement(element);
      section?.elements.push(this.duplicateElement(element, true) as PositionedUIElement);
    });
    this.unitService.updateUnitDefinition();
  }

  /* - Also changes position of the element to not cover copied element. */
  duplicateElement(element: UIElement, adjustPosition: boolean = false): UIElement {
    const newElement = ElementFactory.createElement({ ...element.getBlueprint() }, this.idService);
    if (newElement.position && adjustPosition) {
      newElement.position.xPosition += 10;
      newElement.position.yPosition += 10;
      newElement.position.gridRow = null;
      newElement.position.gridColumn = null;
    }
    return newElement;
  }

  static getRemovedTextAnchorIDs(element: TextElement, newValue: string): string[] {
    return TextElement.getAnchorIDs(element.text)
      .filter(el => !TextElement.getAnchorIDs(newValue).includes(el));
  }

  updateSelectedElementsPositionProperty(property: keyof PositionProperties, value: UIElementValue): void {
    this.updateElementsPositionProperty(this.selectionService.getSelectedElements(), property, value);
  }

  updateElementsPositionProperty(elements: UIElement[],
                                 property: keyof PositionProperties,
                                 value: UIElementValue): void {
    elements.forEach(element => {
      /* Its own copy for every element, as in updateElementsProperty: the four margins are the only
         object-valued members of the group, and one value handed to a selection would leave them all
         holding the same Measurement. The first writer that changes such an object in place -- rather
         than replacing it, which is what every writer does today -- would move the margin of every
         element that happened to be selected with it (#1193). */
      element.setPositionProperty(property, copyPlainData(value));
    });
    this.reorderSectionsOfElements(elements);
    this.unitService.elementPropertyUpdated.next();
    this.unitService.updateUnitDefinition();
  }

  updateElementsDimensionsProperty(elements: UIElement[],
                                   property: keyof DimensionProperties,
                                   value: number | boolean | null): void {
    elements.forEach(element => {
      element.setDimensionsProperty(property, value);
      if (element.type === 'geometry') {
        this.unitService.geometryElementPropertyUpdated.next(element.id);
      }
    });
    this.unitService.elementPropertyUpdated.next();
    this.unitService.updateUnitDefinition();
  }

  /* Sorts the sections the written elements are in, looked up in the unit rather than taken from the
     selection: a cross-section drag moves the element and writes its position in the same
     synchronous block, before the overlays are rebuilt, so the selection still describes the section
     it came from -- and the target would keep a stale tab order (#1204). */
  private reorderSectionsOfElements(elements: UIElement[]): void {
    const sections = elements
      .map(element => this.unitService.unit.getSectionOfElement(element))
      .filter((section): section is Section => !!section);
    new Set(sections).forEach(section => ElementService.reorderElements(section));
  }

  /* Reorder elements by their position properties, so the tab order is correct */
  private static reorderElements(section: Section) {
    const sectionElementList = section.elements;
    const isDynamicPositioning = section.dynamicPositioning;
    const sortDynamicPositioning = (a: PositionedUIElement, b: PositionedUIElement) => {
      const rowSort =
        (a.position.gridRow !== null ? a.position.gridRow : Infinity) -
        (b.position.gridRow !== null ? b.position.gridRow : Infinity);
      if (rowSort === 0) {
        // gridColumn is nullable, and the subtraction coerced a null to 0 - kept as it was.
        return (a.position.gridColumn ?? 0) - (b.position.gridColumn ?? 0);
      }
      return rowSort;
    };
    const sortStaticPositioning = (a: PositionedUIElement, b: PositionedUIElement) => {
      const ySort = a.position.yPosition - b.position.yPosition;
      if (ySort === 0) {
        return a.position.xPosition - b.position.xPosition;
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
