import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { UIElement } from 'common/models/elements/element';

@Component({
  selector: 'aspect-border-properties',
  template: `
    <div class="fx-column-start-stretch">
      <mat-checkbox *ngIf="combinedProperties.hasBorderTop !== undefined"
                    [checked]="$any(combinedProperties).hasBorderTop"
                    (change)="updateModel.emit({ property: 'hasBorderTop', value: $event.checked })">
        {{'propertiesPanel.hasBorderTop' | translate }}
      </mat-checkbox>
      <mat-checkbox *ngIf="combinedProperties.hasBorderBottom !== undefined"
                    [checked]="$any(combinedProperties).hasBorderBottom"
                    (change)="updateModel.emit({ property: 'hasBorderBottom', value: $event.checked })">
        {{'propertiesPanel.hasBorderBottom' | translate }}
      </mat-checkbox>
      <mat-checkbox *ngIf="combinedProperties.hasBorderLeft !== undefined"
                    [checked]="$any(combinedProperties).hasBorderLeft"
                    (change)="updateModel.emit({ property: 'hasBorderLeft', value: $event.checked })">
        {{'propertiesPanel.hasBorderLeft' | translate }}
      </mat-checkbox>
      <mat-checkbox *ngIf="combinedProperties.hasBorderRight !== undefined"
                    [checked]="$any(combinedProperties).hasBorderRight"
                    (change)="updateModel.emit({ property: 'hasBorderRight', value: $event.checked })">
        {{'propertiesPanel.hasBorderRight' | translate }}
      </mat-checkbox>
    </div>
  `,
  styles: [`
    .fx-column-start-stretch {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;
    }
  `]
})
export class BorderPropertiesComponent {
  @Input() combinedProperties!: UIElement;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: string | number | boolean | null }>();
}
