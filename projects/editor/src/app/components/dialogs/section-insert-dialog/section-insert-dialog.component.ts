import {
  Component, Inject, OnInit, OnDestroy
} from '@angular/core';
import { Section } from 'common/models/section';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { UIElement } from 'common/models/elements/element';
import { TranslateService } from '@ngx-translate/core';
import { IDService } from 'editor/src/app/services/id.service';
import { UnitService } from 'editor/src/app/services/unit.service';

@Component({
  templateUrl: './section-insert-dialog.component.html',
  styleUrls: ['./section-insert-dialog.component.scss'],
  standalone: false
})
export class SectionInsertDialogComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();

  operationStatus: 'red' | 'orange' | 'green' | 'none' = 'none';
  operationStatusText: string = 'Kopierten Abschnitt einfügen:';
  isPastedTextPresent = false;
  newSection: Section | null = null;

  savedSectionCode: string | undefined;
  selectedMethod: 'savedCode' | 'pastedCode' = 'pastedCode';
  replaceSection: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { isSelectedSectionEmpty: boolean },
              private unitService: UnitService,
              private idService: IDService,
              private dialogRef: MatDialogRef<SectionInsertDialogComponent>,
              private translateService: TranslateService) { }

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
      this.operationStatusText = this.translateService.instant('Fehler beim Lesen des Abschnitts!');
      return;
    }
    try {
      this.newSection = new Section(JSON.parse(pastedText));
      this.checkDuplicates();
    } catch (e) {
      this.operationStatusText = this.translateService.instant('Fehler beim Lesen des Abschnitts!');
      this.operationStatus = 'red';
    }
  }

  private checkDuplicates(): void {
    if (this.newSection && this.findElementsWithDuplicateID(this.newSection.getAllElements()).length > 0) {
      this.operationStatusText =
        this.translateService.instant('Doppelte IDs festgestellt. Weiter mit neu generierten IDs?');
      this.operationStatus = 'orange';
    } else {
      this.operationStatusText = this.translateService.instant('Abschnitt wurde erfolgreich gelesen.');
      this.operationStatus = 'green';
    }
  }

  confirm(): void {
    const sectionToReturn = (this.newSection && this.operationStatus === 'orange') ?
      { ...this.newSection, elements: this.newSection.elements.map(el => el.getBlueprint()) } :
      this.newSection;
    this.dialogRef.close({ newSection: sectionToReturn, replaceSection: this.replaceSection });
  }

  private findElementsWithDuplicateID(elements: UIElement[]): UIElement[] {
    return elements.filter(element => !this.idService.isIDAvailable(element.id) ||
      (element.alias && !this.idService.isAliasAvailable(element.alias))
    );
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
