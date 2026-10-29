import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UIElement } from 'common/models/elements/element';
import { ReferenceList, SectionLocation } from 'editor/src/app/classes/reference-manager';
import { UnitService } from 'editor/src/app/services/unit.service';
import { DialogService } from 'editor/src/app/services/dialog.service';

@Component({
  selector: 'aspect-delete-reference-dialog',
  templateUrl: './delete-reference-dialog.component.html',
  styleUrls: ['./delete-reference-dialog.component.scss'],
  standalone: false
})
export class DeleteReferenceDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { refs: ReferenceList[] },
              private dialogService: DialogService,
              private unitService: UnitService) { }

  /** Going to what refers keeps the text as it was: the author resolves the reference by hand first (#1520). */
  goToElement(element: UIElement): void {
    this.dialogService.closeAllThen(() => this.unitService.revealElement(element));
  }

  goToSection(location: SectionLocation): void {
    this.dialogService.closeAllThen(() => this.unitService.revealSection(location));
  }
}
