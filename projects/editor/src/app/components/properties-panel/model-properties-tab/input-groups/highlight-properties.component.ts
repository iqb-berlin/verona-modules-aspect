import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CombinedProperties } from 'editor/src/app/components/properties-panel/element-properties-panel.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'aspect-highlight-properties',
  standalone: true,
  imports: [
    MatCheckboxModule,
    NgIf,
    TranslateModule,
    MatFormFieldModule
  ],
  template: `
    <mat-checkbox *ngIf="combinedProperties.highlightableYellow !== undefined"
                  [disabled]="disabled"
                  [checked]="$any(combinedProperties.highlightableYellow)"
                  (change)="updateModel.emit({ property: 'highlightableYellow', value: $event.checked })">
      {{'propertiesPanel.highlightableYellow' | translate }}
    </mat-checkbox>
    <mat-checkbox *ngIf="combinedProperties.highlightableTurquoise !== undefined"
                  [disabled]="disabled"
                  [checked]="$any(combinedProperties.highlightableTurquoise)"
                  (change)="updateModel.emit({ property: 'highlightableTurquoise', value: $event.checked })">
      {{'propertiesPanel.highlightableTurquoise' | translate }}
    </mat-checkbox>
    <mat-checkbox *ngIf="combinedProperties.highlightableOrange !== undefined"
                  [disabled]="disabled"
                  [checked]="$any(combinedProperties.highlightableOrange)"
                  (change)="updateModel.emit({ property: 'highlightableOrange', value: $event.checked })">
      {{'propertiesPanel.highlightableOrange' | translate }}
    </mat-checkbox>
  `
})

export class HighlightPropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Input() disabled!: boolean;
  @Output() updateModel =
    new EventEmitter<{
      property: string;
      value: string | number | boolean | string[];
      isInputValid?: boolean | null
    }>();
}
