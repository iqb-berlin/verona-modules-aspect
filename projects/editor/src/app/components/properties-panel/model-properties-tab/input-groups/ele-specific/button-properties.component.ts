import {
  Component, EventEmitter, Input, OnDestroy, Output
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UIElement } from 'common/models/elements/element';
import { TooltipPosition } from 'common/models/ui-element-interfaces';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DialogService } from 'editor/src/app/services/dialog.service';

@Component({
  selector: 'aspect-button-properties',
  imports: [
    NgIf,
    TranslateModule,
    MatButtonModule,
    MatCheckboxModule
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
          @if (combinedProperties.tooltipText !== undefined) {
            <button mat-raised-button
                    (click)="editTooltip()">
              {{ 'propertiesPanel.editTooltip' | translate }}
            </button>
          }
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
export class ButtonPropertiesComponent implements OnDestroy {
  @Input() combinedProperties!: UIElement;
  @Output() updateModel =
    new EventEmitter<{
      property: string; value: string | number | boolean | null, isInputValid?: boolean | null
    }>();

  checked = false;

  private ngUnsubscribe = new Subject<void>();

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

  editTooltip(): void {
    this.dialogService.showTooltipDialog(
      (this.combinedProperties.tooltipText as string) || undefined,
      this.combinedProperties.tooltipPosition as TooltipPosition
    )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(result => {
        if (result) {
          if (result.action === 'delete') {
            this.updateModel.emit({ property: 'tooltipText', value: '' });
          } else {
            this.updateModel.emit({ property: 'tooltipText', value: result.tooltipText });
            this.updateModel.emit({ property: 'tooltipPosition', value: result.tooltipPosition });
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
