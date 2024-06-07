import { Injectable } from '@angular/core';
import {  Subject } from 'rxjs';
import { FileService } from 'common/services/file.service';
import { MessageService } from 'editor/src/app/services/message.service';
import { Unit, UnitProperties } from 'common/models/unit';
import { DragNDropValueObject } from 'common/models/elements/label-interfaces';
import {
  CompoundElement, PositionedUIElement, UIElement
} from 'common/models/elements/element';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import { StateVariable } from 'common/models/state-variable';
import { VersionManager } from 'common/services/version-manager';
import { ReferenceList, ReferenceManager } from 'editor/src/app/services/reference-manager';
import { DialogService } from '../dialog.service';
import { VeronaAPIService } from '../verona-api.service';
import { SelectionService } from '../selection.service';
import { IDService } from '../id.service';
import { UnitDefinitionSanitizer } from '../sanitizer';
import { HistoryService, UnitUpdateCommand } from 'editor/src/app/services/history.service';
import { Page } from 'common/models/page';
import { Section } from 'common/models/section';
import { MatDialog } from '@angular/material/dialog';
import { TableWizardComponent } from 'editor/src/app/components/dialogs/wizards/table-wizard.component';
import {
  BorderStyles,
  PositionProperties,
  PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';
import { FrameElement } from 'common/models/elements/frame/frame';
import { ElementFactory } from 'common/util/element.factory';

@Injectable({
  providedIn: 'root'
})
export class UnitService {
  unit: Unit;
  elementPropertyUpdated: Subject<void> = new Subject<void>();
  geometryElementPropertyUpdated: Subject<string> = new Subject<string>();
  mathTableElementPropertyUpdated: Subject<string> = new Subject<string>();
  referenceManager: ReferenceManager;
  savedSectionCode: string | undefined;

  constructor(private selectionService: SelectionService,
              private veronaApiService: VeronaAPIService,
              private messageService: MessageService,
              private dialogService: DialogService,
              private historyService: HistoryService,
              public dialog: MatDialog,
              private idService: IDService) {
    this.unit = new Unit();
    this.referenceManager = new ReferenceManager(this.unit);
  }

  loadUnitDefinition(unitDefinition: string): void {
    if (unitDefinition) {
      try {
        let unitDef = JSON.parse(unitDefinition);
        if (!VersionManager.hasCompatibleVersion(unitDef)) {
          if (VersionManager.isNewer(unitDef)) {
            throw Error('Unit-Version ist neuer als dieser Editor. Bitte mit der neuesten Version öffnen.');
          }
          if (!VersionManager.needsSanitization(unitDef)) {
            throw Error('Unit-Version ist veraltet. Sie kann mit Version 1.38/1.39 aktualisiert werden.');
          }
          this.dialogService.showSanitizationDialog().subscribe(() => {
            unitDef = UnitDefinitionSanitizer.sanitizeUnit(unitDef);
            this.loadUnit(unitDef);
            this.updateUnitDefinition();
          });
        } else {
          this.loadUnit(unitDef);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        if (e instanceof Error) this.dialogService.showUnitDefErrorDialog(e.message);
      }
    } else {
      this.idService.reset();
      this.unit = new Unit();
      this.referenceManager = new ReferenceManager(this.unit);
    }
  }

  private loadUnit(parsedUnitDefinition?: string): void {
    this.idService.reset();
    this.unit = new Unit(parsedUnitDefinition as unknown as UnitProperties);
    this.idService.registerUnitIds(this.unit);
    this.referenceManager = new ReferenceManager(this.unit);

    const invalidRefs = this.referenceManager.getAllInvalidRefs();
    if (invalidRefs.length > 0) {
      this.referenceManager.removeInvalidRefs(invalidRefs);
      this.messageService.showFixedReferencePanel(invalidRefs);
      this.updateUnitDefinition();
    }
  }

  updateUnitDefinition(command?: UnitUpdateCommand): void {
    if (command) {
      let deletedData = command.command();
      if (deletedData instanceof Promise) {
        deletedData.then((deletedData) => {
          this.historyService.addCommand(command, deletedData);
        });
      } else {
        this.historyService.addCommand(command, deletedData);
      }
    }
    this.veronaApiService.sendChanged(this.unit);
  }

  rollback(): void {
    this.historyService.rollback();
    this.veronaApiService.sendChanged(this.unit);
  }

  registerIDs(elements: UIElement[]): void {
    elements.forEach(element => {
      if (['drop-list', 'drop-list-simple'].includes((element as UIElement).type as string)) {
        (element as DropListElement).value.forEach(value => this.idService.addID(value.id));
      }
      if (['likert', 'cloze'].includes((element as UIElement).type as string)) {
        element.getChildElements().forEach(el => {
          this.idService.addID(el.id);
          if ((element as UIElement).type === 'drop-list') {
            (element as DropListElement).value.forEach(value => this.idService.addID(value.id));
          }
        });
      }
      this.idService.addID(element.id);
    });
  }

  unregisterIDs(elements: UIElement[]): void {
    elements.forEach(element => {
      if (element.type === 'drop-list') {
        ((element as DropListElement).value as DragNDropValueObject[]).forEach((value: DragNDropValueObject) => {
          this.idService.unregisterID(value.id);
        });
      }
      if (element instanceof CompoundElement) {
        element.getChildElements().forEach((childElement: UIElement) => {
          this.idService.unregisterID(childElement.id);
        });
      }
      this.idService.unregisterID(element.id);
    });
  }

  saveUnit(): void {
    FileService.saveUnitToFile(JSON.stringify(this.unit));
  }

  async loadUnitFromFile(): Promise<void> {
    this.loadUnitDefinition(await FileService.loadFile(['.json', '.voud']));
  }

  getNewValueID(): string {
    return this.idService.getAndRegisterNewID('value');
  }

  /* Used by props panel to show available dropLists to connect */
  getAllDropListElementIDs(): string[] {
    const allDropLists = [
      ...this.unit.getAllElements('drop-list'),
      ...this.unit.getAllElements('drop-list-simple')];
    return allDropLists.map(dropList => dropList.id);
  }

  updateStateVariables(stateVariables: StateVariable[]): void {
    this.unit.stateVariables = stateVariables;
    this.updateUnitDefinition();
  }

  /* Check references and confirm */
  prepareDelete(deletedObjectType: 'page' | 'section' | 'elements', object: Page | Section | UIElement[]): Promise<boolean> {
    return new Promise((resolve) => {
      let refs: ReferenceList[] = [];
      let dialogText: string = '';
      switch (deletedObjectType) {
        case "page":
          refs = this.referenceManager.getPageElementsReferences(
            this.unit.pages[this.selectionService.selectedPageIndex]
          );
          const pageNavButtonRefs = this.referenceManager.getButtonReferencesForPage(
            this.selectionService.selectedPageIndex
          );
          refs = refs.concat(pageNavButtonRefs);
          dialogText = `Seite ${this.selectionService.selectedPageIndex + 1} löschen?`;
          break;
        case "section":
          refs = this.referenceManager.getSectionElementsReferences([object as Section]);
          dialogText = `Abschnitt ${this.selectionService.selectedSectionIndex + 1} löschen?`;
          break;
        case "elements":
          refs = this.referenceManager.getElementsReferences(object as UIElement[]);
          dialogText = 'Folgende Elemente werden gelöscht:';
      }

      this.dialogService.showDeleteConfirmDialog(
        dialogText,
        deletedObjectType == 'elements' ? object as UIElement[] : undefined,
        refs)
        .subscribe((result: boolean) => {
          if (result) {
            if (refs.length > 0) ReferenceManager.deleteReferences(refs); // TODO rollback?
            resolve(true);
          } else {
            if (refs.length > 0) this.messageService.showReferencePanel(refs);
            resolve(false);
          }
        });
    });
  }

  applyTemplate(templateName: string) {
    this.openTableWizard();
  }

  openTableWizard(): void {
    const selectedSection = this.unit.pages[this.selectionService.selectedPageIndex]
      .sections[this.selectionService.selectedSectionIndex];
    const dialogRef = this.dialog.open(TableWizardComponent, {
      data: { section: selectedSection },
      height: '600px',
      width: '800px'
    });

    dialogRef.afterClosed().subscribe((result: { newSection: Section, startRow: number, startColumn: number, endRow: number, endColumn: number, borderStyle: BorderStyles }) => {
      console.log('result', result);
      if (result) {
        // @ts-ignore
        this.createBorderElements(...Object.values(result));
      }
    });
  }

  private createBorderElements(newSection: Section,
                               startRow: number, startColumn: number, endRow: number, endColumn: number,
                               borderStyle: BorderStyles): void {
    console.log('createBorderElements', arguments);
    for (let row = startRow; row <= endRow; row += 1) {
      for (let column = startColumn; column <= endColumn; column += 1) {
        const skippedBorders: string[] = [];
        if (row !== startRow) skippedBorders.push('top');
        if (column !== startColumn) skippedBorders.push('left');

        this.addFrameToSection(newSection, row + 1, column + 1, borderStyle, skippedBorders);
      }
    }

    this.unit.pages[this.selectionService.selectedPageIndex]
      .sections[this.selectionService.selectedSectionIndex] = newSection;
  }

  private addFrameToSection(section: Section,
                            positionX: number, positionY: number,
                            borderStyle: BorderStyles,
                            skipBorderSide: string[] = []): void {
    let id = `frame-${positionX}-${positionY}`;
    if (!this.idService.isIdAvailable(id)) id = this.idService.getAndRegisterNewID('frame');

    section.addElement(ElementFactory.createElement({
      type: 'frame',
      hasBorderTop: !skipBorderSide.includes('top'),
      hasBorderBottom: !skipBorderSide.includes('bottom'),
      hasBorderLeft: !skipBorderSide.includes('left'),
      hasBorderRight: !skipBorderSide.includes('right'),
      position: PropertyGroupGenerators.generatePositionProps({
        gridRow: positionX,
        gridColumn: positionY
      }),
      styling: borderStyle,
      id: id
    }) as PositionedUIElement);
  }
}
