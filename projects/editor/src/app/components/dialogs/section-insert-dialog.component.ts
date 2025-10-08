import { Component, Inject, OnInit } from '@angular/core';
import { Section } from 'common/models/section';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { UIElement } from 'common/models/elements/element';
import { TranslateService } from '@ngx-translate/core';
import { IDService } from 'editor/src/app/services/id.service';
import { UnitService } from 'editor/src/app/services/unit-services/unit.service';

@Component({
    template: `
    <h2 mat-dialog-title>Seitenabschnitt einfügen</h2>
    <mat-dialog-content>
      <mat-radio-group [style]="'display: flex; flex-direction: column'"
                       [(ngModel)]="selectedMethod">
        <mat-radio-button value="savedCode" [disabled]="!savedSectionCode">
          Gespeicherten Abschnitt einfügen
        </mat-radio-button>
          <p *ngIf="savedSectionCode" class="radio-child-item" [style.color]="'green'">
            Gespeicherter Abschnitt gefunden.
          </p>
          <p *ngIf="!savedSectionCode" class="radio-child-item" [style.color]="'var(--warn)'">
            Kein gespeicherter Abschnitt gefunden.
          </p>
        <mat-radio-button value="pastedCode">
          Abschnitt über Zwischenablage einfügen
        </mat-radio-button>
        <div class="radio-child-item message-area" [style.color]="operationStatus">
          {{operationStatusText}}
        </div>
        <div class="radio-child-item paste-area" contenteditable="true"
             (click)="selectedMethod = 'pastedCode'"
             (paste)="pasteSectionFromClipboard($event)">
        </div>
      </mat-radio-group>

      <mat-divider [style.margin-top.px]="20" [style.margin-bottom.px]="10"></mat-divider>

      <mat-checkbox [(ngModel)]="replaceSection">
        Bestehenden Abschnitt ersetzen
      </mat-checkbox>

    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button *ngIf="selectedMethod == 'savedCode' || operationStatus === 'green' || operationStatus === 'orange'"
              [mat-dialog-close]="{ newSection, replaceSection }">
        {{'confirm' | translate }}
      </button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </mat-dialog-actions>
  `,
    styles: [
        '.paste-area {width: 250px; height: 60px; border: 1px solid; overflow: hidden}',
        '.radio-child-item {margin-left: 35px; font-size: smaller;}',
        ':host ::ng-deep mat-radio-button .mdc-label {font-size: larger;}'
    ],
    standalone: false
})
export class SectionInsertDialogComponent implements OnInit {
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
              private translateService: TranslateService) { }

  ngOnInit(): void {
    if (this.unitService.savedSectionCode) {
      this.savedSectionCode = this.unitService.savedSectionCode;
      this.selectedMethod = 'savedCode';
      this.newSection = new Section(JSON.parse(this.unitService.savedSectionCode));
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

      if (this.findElementsWithDuplicateID(this.newSection.getAllElements()).length > 0) {
        this.operationStatusText =
          this.translateService.instant('Doppelte IDs festgestellt. Weiter mit neu generierten IDs?');
        this.operationStatus = 'orange';
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
    return elements.filter(element => !this.idService.isAliasAvailable(element.id));
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
