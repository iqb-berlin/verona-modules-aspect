import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { UIElement } from 'common/models/elements/element';
import { TranslateModule } from '@ngx-translate/core';
import { NgForOf, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { DialogService } from 'editor/src/app/services/dialog.service';

@Component({
    selector: 'aspect-button-properties',
    imports: [
        NgIf,
        NgForOf,
        TranslateModule,
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        FormsModule
    ],
    template: `
    <ng-container *ngIf="combinedProperties.asLink !== undefined">
      <fieldset>
        <legend>{{ 'propertiesPanel.presentation' | translate }}</legend>
        <div class="fx-column-start-stretch" [style.gap.px]="20">

          <div class="fx-row-space-between-stretch">
            <button mat-button
                    class="fx-fill"
                    [class.checked]="!combinedProperties.imageSrc && !combinedProperties.asLink"
                    (click)="removeImage(); updateModel.emit({ property: 'asLink', value: false });">
              {{ 'propertiesPanel.button' | translate }}
            </button>
            <button mat-button class="fx-fill"
                    [class.checked]="!!combinedProperties.imageSrc && !combinedProperties.asLink"
                    (click)="importImage(); updateModel.emit({ property: 'asLink', value: false });">
              {{ 'propertiesPanel.image' | translate }}
            </button>
            <button mat-button
                    class="fx-fill"
                    [class.checked]="!combinedProperties.imageSrc && !!combinedProperties.asLink"
                    (click)="removeImage(); updateModel.emit({ property: 'asLink', value: true });">
              {{ 'propertiesPanel.link' | translate }}
            </button>
          </div>

          <div *ngIf="!!combinedProperties.imageSrc">
            <div>
              <button mat-raised-button
                      [disabled]="combinedProperties.asLink"
                      (click)="importImage();">
                {{ 'updateImage' | translate }}
              </button>
              <button mat-raised-button
                      class="fx-fill"
                      (click)="removeImage()">
                {{ 'removeImage' | translate }}
              </button>
            </div>
            <img class="image-preview"
                 [src]="combinedProperties.imageSrc">
          </div>

          <div *ngIf="!combinedProperties.asLink && !combinedProperties.imageSrc">
            <mat-checkbox [checked]="combinedProperties.labelAlignment === 'super'"
                          [disabled]="combinedProperties.labelAlignment === 'sub'"
                          (change)="updateModel.emit({ property: 'labelAlignment',
                                                       value: $event.checked ? 'super' : 'baseline' })">
              {{ 'propertiesPanel.super' | translate }}
            </mat-checkbox>
            <mat-checkbox [checked]="combinedProperties.labelAlignment === 'sub'"
                          [disabled]="combinedProperties.labelAlignment === 'super'"
                          (change)="updateModel.emit({ property: 'labelAlignment',
                                                       value: $event.checked ? 'sub' : 'baseline' })">
              {{ 'propertiesPanel.sub' | translate }}
            </mat-checkbox>
          </div>
        </div>
      </fieldset>
      <fieldset>
        <legend>{{ 'propertiesPanel.tooltip' | translate }}</legend>
        <div class="fx-column-start-stretch">
          <mat-form-field *ngIf="combinedProperties.tooltipText !== undefined">
            <mat-label>{{ 'propertiesPanel.tooltipText' | translate }}</mat-label>
            <input matInput
                   [ngModel]="combinedProperties.tooltipText"
                   (ngModelChange)="updateModel.emit({ property: 'tooltipText', value: $event })">
          </mat-form-field>
          <mat-form-field *ngIf="combinedProperties.tooltipPosition !== undefined" appearance="fill">
            <mat-label>{{ 'propertiesPanel.tooltipPosition' | translate }}</mat-label>
            <mat-select [value]="combinedProperties.tooltipPosition"
                        (selectionChange)="updateModel.emit({ property: 'tooltipPosition', value: $event.value })">
              <mat-option *ngFor="let option of ['left', 'right', 'above', 'below']"
                          [value]="option">
                {{ 'propertiesPanel.' + option | translate }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </fieldset>
    </ng-container>
  `,
    styles: [`
    .checked {
      background-color: #ccc;
    }

    .image-preview {
      max-width: 100%;
      max-height: 100%;
    }

    .fx-fill {
      flex: 1 1 0;
    }
  `]
})
export class ButtonPropertiesComponent {
  @Input() combinedProperties!: UIElement;
  @Output() updateModel =
    new EventEmitter<{
      property: string; value: string | number | boolean | null, isInputValid?: boolean | null
    }>();

  checked = false;

  constructor(private dialogService: DialogService) { }

  async importImage(): Promise<void> {
    const file = await this.dialogService.importImage();
    if (file) {
      this.updateModel.emit({ property: 'imageSrc', value: file.content });
    }
  }

  removeImage(): void {
    this.updateModel.emit({ property: 'imageSrc', value: null });
  }
}
