import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CombinedProperties } from 'editor/src/app/components/properties-panel/element-properties-panel.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'aspect-math-field-props',
  standalone: true,
  imports: [
    TranslateModule,
    MatCheckboxModule
  ],
  template: `
    <mat-checkbox [checked]="$any(combinedProperties.enableModeSwitch)"
                  (change)="updateModel.emit({ property: 'enableModeSwitch', value: $event.checked })">
      {{'propertiesPanel.enableModeSwitch' | translate }}
    </mat-checkbox>
  `
})
export class MathFieldPropsComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: boolean, isInputValid?: boolean | null }>();
}
