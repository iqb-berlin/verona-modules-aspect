import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CombinedProperties } from 'editor/src/app/components/properties-panel/element-properties-panel/element-properties-panel.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'aspect-highlight-properties',
  imports: [
    MatCheckboxModule,
    NgIf,
    TranslateModule,
    MatFormFieldModule
  ],
  templateUrl: './highlight-properties.component.html'
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
