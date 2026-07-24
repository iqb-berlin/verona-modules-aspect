import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { UIElement } from 'common/models/elements/element';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'aspect-border-properties',
  imports: [
    MatCheckboxModule,
    TranslateModule
  ],
  template: `
    <div class="fx-column-start-stretch">
      <mat-checkbox [checked]="$any(combinedProperties).hasBorderTop"
                    (change)="updateModel.emit({ property: 'hasBorderTop', value: $event.checked })">
        {{ 'propertiesPanel.hasBorderTop' | translate }}
      </mat-checkbox>
      <mat-checkbox [checked]="$any(combinedProperties).hasBorderBottom"
                    (change)="updateModel.emit({ property: 'hasBorderBottom', value: $event.checked })">
        {{ 'propertiesPanel.hasBorderBottom' | translate }}
      </mat-checkbox>
      <mat-checkbox [checked]="$any(combinedProperties).hasBorderLeft"
                    (change)="updateModel.emit({ property: 'hasBorderLeft', value: $event.checked })">
        {{ 'propertiesPanel.hasBorderLeft' | translate }}
      </mat-checkbox>
      <mat-checkbox [checked]="$any(combinedProperties).hasBorderRight"
                    (change)="updateModel.emit({ property: 'hasBorderRight', value: $event.checked })">
        {{ 'propertiesPanel.hasBorderRight' | translate }}
      </mat-checkbox>
    </div>
  `
})
export class BorderPropertiesComponent {
  @Input() combinedProperties!: UIElement;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: string | number | boolean | null }>();
}
