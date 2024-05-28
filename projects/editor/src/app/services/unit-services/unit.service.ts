import { Injectable } from '@angular/core';
import {  Subject } from 'rxjs';
import { FileService } from 'common/services/file.service';
import { MessageService } from 'common/services/message.service';
import { Unit, UnitProperties } from 'common/models/unit';
import { DragNDropValueObject } from 'common/models/elements/label-interfaces';
import {
  CompoundElement, UIElement
} from 'common/models/elements/element';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import { StateVariable } from 'common/models/state-variable';
import { VersionManager } from 'common/services/version-manager';
import { ReferenceManager } from 'editor/src/app/services/reference-manager';
import { DialogService } from '../dialog.service';
import { VeronaAPIService } from '../verona-api.service';
import { SelectionService } from '../selection.service';
import { IDService } from '../id.service';
import { UnitDefinitionSanitizer } from '../sanitizer';
import { HistoryService, UnitUpdateCommand } from 'editor/src/app/services/history.service';

@Injectable({
  providedIn: 'root'
})
export class UnitService {
  unit: Unit;
  elementPropertyUpdated: Subject<void> = new Subject<void>();
  geometryElementPropertyUpdated: Subject<string> = new Subject<string>();
  mathTableElementPropertyUpdated: Subject<string> = new Subject<string>();
  referenceManager: ReferenceManager;

  constructor(private selectionService: SelectionService,
              private veronaApiService: VeronaAPIService,
              private messageService: MessageService,
              private dialogService: DialogService,
              private historyService: HistoryService,

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
      const deletedData = command.command();
      this.historyService.addCommand(command, deletedData);
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
}
