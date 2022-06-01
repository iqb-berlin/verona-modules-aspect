import { Component, Inject } from '@angular/core';
import { Section } from 'common/models/section';
import { MessageService } from 'common/services/message.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { UIElement } from 'common/models/elements/element';
import { IDManager } from 'common/util/id-manager';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-section-insert-dialog',
  template: `
    <mat-dialog-content>
      <div (mouseenter)="hovered = true;" (mouseleave)="hovered = false;">
        <div class="paste-area" contenteditable="true" *ngIf="isPastedTextPresent === false"
             (paste)="pasteSectionFromClipboard($event)">
        </div>
        <div *ngIf="!hovered || isPastedTextPresent" class="message-area" [style.background-color]="operationStatus">
          {{operationStatusText}}
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button *ngIf="operationStatus === 'green' || operationStatus === 'yellow'"
              [mat-dialog-close]="newSection">
        {{'confirm' | translate }}
      </button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [
    '.mat-dialog-content {width: 400px; height: 200px;}',
    '.paste-area {position: absolute; width: 400px; height: 200px; border: 1px solid; overflow: hidden}',
    '.message-area {position: absolute; width: 400px; height: 200px; text-align: center; font-size: large;}'
  ]
})
export class SectionInsertDialogComponent {
  private ngUnsubscribe = new Subject<void>();

  operationStatus: 'red' | 'yellow' | 'green' | 'none' = 'none';
  operationStatusText: string = this.translateService.instant('Bitte kopierten Abschnitt einfügen');
  hovered = false;
  isPastedTextPresent = false;
  newSection: Section | null = null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { existingSection: Section },
              private messageService: MessageService,
              private translateService: TranslateService) { }


  pasteSectionFromClipboard(event: ClipboardEvent) {
    this.isPastedTextPresent = true;
    const pastedText = event.clipboardData?.getData('Text');
    if (!pastedText) {
      this.operationStatusText = this.translateService.instant('Fehler beim Lesen des Abschnitts!');
      return;
    }
    try {
      this.newSection = new Section(JSON.parse(pastedText));

      if (this.findElementsWithDuplicateID(this.newSection.getAllChildElements()).length > 0) {
        this.operationStatusText =
          this.translateService.instant('Doppelte IDs festgestellt. Weiter mit neu generierten IDs?');
        this.operationStatus = 'yellow';
      } else {
        this.operationStatusText = this.translateService.instant('Abschnitt wurde erfolgreich gelesen.');
        this.operationStatus = 'green';
      }
    } catch (e) {
      this.operationStatusText = this.translateService.instant('Fehler beim Lesen des Abschnitts!');
      this.operationStatus = 'red';
    }
  }

  private findElementsWithDuplicateID(elements: UIElement[]): UIElement[] {
    return elements.filter(element => !IDManager.getInstance().isIdAvailable(element.id));
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
