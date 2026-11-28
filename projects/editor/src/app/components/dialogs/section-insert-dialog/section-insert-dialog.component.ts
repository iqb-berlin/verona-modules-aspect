import {
  Component, Inject, OnInit, OnDestroy
} from '@angular/core';
import { Section } from 'common/models/section';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { UIElement } from 'common/models/elements/element';
import { DropListElement } from 'common/models/elements/drop-list';
import { DragNDropValueObject } from 'common/models/label-interfaces';
import { IDService } from 'editor/src/app/services/id.service';
import { UnitService } from 'editor/src/app/services/unit.service';

@Component({
  templateUrl: './section-insert-dialog.component.html',
  styleUrls: ['./section-insert-dialog.component.scss'],
  standalone: false
})
export class SectionInsertDialogComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();

  /** How reading the section went; the template shows it as a symbol in front of the status line (#1520). */
  operationStatus: 'error' | 'warning' | 'success' | 'none' = 'none';
  /** The translation key of the status line. */
  operationStatusKey: string = 'sectionInsert.pastePrompt';
  isPastedTextPresent = false;
  newSection: Section | null = null;

  savedSectionCode: string | undefined;
  selectedMethod: 'savedCode' | 'pastedCode' = 'pastedCode';
  replaceSection: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { isSelectedSectionEmpty: boolean },
              private unitService: UnitService,
              private idService: IDService,
              private dialogRef: MatDialogRef<SectionInsertDialogComponent>) { }

  ngOnInit(): void {
    if (this.unitService.savedSectionCode) {
      this.savedSectionCode = this.unitService.savedSectionCode;
      this.selectedMethod = 'savedCode';
      this.newSection = new Section(JSON.parse(this.unitService.savedSectionCode));
      this.checkDuplicates();
    }
    this.replaceSection = this.data.isSelectedSectionEmpty;
  }

  pasteSectionFromClipboard(event: ClipboardEvent): void {
    event.preventDefault();
    this.isPastedTextPresent = true;
    const pastedText = event.clipboardData?.getData('Text');
    if (!pastedText) {
      // A section read from an earlier paste must not stay on offer behind an error (#1520).
      this.newSection = null;
      this.operationStatusKey = 'sectionInsert.readError';
      this.operationStatus = 'error';
      return;
    }
    try {
      this.newSection = new Section(JSON.parse(pastedText));
      this.checkDuplicates();
    } catch {
      this.newSection = null;
      this.operationStatusKey = 'sectionInsert.readError';
      this.operationStatus = 'error';
    }
  }

  private checkDuplicates(): void {
    if (this.newSection && this.findElementsWithDuplicateID(this.newSection.getAllElements()).length > 0) {
      this.operationStatusKey = 'sectionInsert.duplicateIds';
      this.operationStatus = 'warning';
    } else if (this.newSection && SectionInsertDialogComponent.itemsOf(this.newSection)
      .some(({ item }) => this.isItemNameTaken(item))) {
      this.operationStatusKey = 'sectionInsert.duplicateItemNames';
      this.operationStatus = 'warning';
    } else {
      this.operationStatusKey = 'sectionInsert.readSuccess';
      this.operationStatus = 'success';
    }
  }

  /**
   * Elements the unit holds already all become blueprints, which get new ids and names, their drop-list items as well.
   * Where only items carry names the unit holds, those items get new ones and nothing else changes: a blueprint would
   * also replace the names of the elements, which the author chose (#1741).
   */
  confirm(): void {
    if (this.newSection && this.operationStatusKey === 'sectionInsert.duplicateItemNames') {
      this.renameTakenItems(this.newSection);
    }
    const sectionToReturn = (this.newSection && this.operationStatusKey === 'sectionInsert.duplicateIds') ?
      { ...this.newSection, elements: this.newSection.elements.map(el => el.getBlueprint()) } :
      this.newSection;
    this.dialogRef.close({ newSection: sectionToReturn, replaceSection: this.replaceSection });
  }

  private findElementsWithDuplicateID(elements: UIElement[]): UIElement[] {
    return elements.filter(element => !this.idService.isIDAvailable(element.id) ||
      (element.alias && !this.idService.isAliasAvailable(element.alias))
    );
  }

  /**
   * Gives the items whose id or name the unit holds new ones, as adding an item in the properties panel does. Not by
   * emptying them: the drop list would then make the name from the id, `value_<timestamp>_1` rather than `value_3`.
   */
  private renameTakenItems(section: Section): void {
    SectionInsertDialogComponent.itemsOf(section)
      .filter(({ item }) => this.isItemNameTaken(item))
      .forEach(({ dropList, index }) => {
        dropList.value[index] = { ...dropList.value[index], ...this.idService.getAndRegisterNewIDs('value') };
      });
  }

  /** An item read without an id or a name gets both from the drop list once the section is inserted. */
  private isItemNameTaken(item: DragNDropValueObject): boolean {
    return (!!item.id && !this.idService.isIDAvailable(item.id)) ||
      (!!item.alias && !this.idService.isAliasAvailable(item.alias));
  }

  /** The drop-list items of the section, cloze gaps included, each with its list and its place there. */
  private static itemsOf(section: Section): { dropList: DropListElement, item: DragNDropValueObject, index: number }[] {
    return (section.getAllElements('drop-list') as DropListElement[])
      .flatMap(dropList => dropList.value.map((item, index) => ({ dropList, item, index })));
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
