import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReferenceList, SectionLocation } from 'editor/src/app/classes/reference-manager';
import { UIElement } from 'common/models/elements/element';
import { UnitService } from 'editor/src/app/services/unit.service';
import { DialogService } from 'editor/src/app/services/dialog.service';

/** The question, what goes, and what refers to it. */
interface DeleteConfirmationData {
  text: string;
  elementList?: UIElement[];
  refs?: ReferenceList[];
}

@Component({
  selector: 'aspect-confirmation-dialog',
  templateUrl: './delete-confirmation-dialog.component.html',
  styleUrls: ['./delete-confirmation-dialog.component.scss'],
  standalone: false
})
export class DeleteConfirmationDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DeleteConfirmationData,
              private dialogService: DialogService,
              private unitService: UnitService) { }

  /**
   * Going to what refers cancels the deletion: the author resolves the reference by hand. Closing leaves the result
   * empty, which the caller takes as a "no" (#1520).
   */
  goToElement(element: UIElement): void {
    this.dialogService.closeAllThen(() => this.unitService.revealElement(element));
  }

  goToSection(location: SectionLocation): void {
    this.dialogService.closeAllThen(() => this.unitService.revealSection(location));
  }
}
