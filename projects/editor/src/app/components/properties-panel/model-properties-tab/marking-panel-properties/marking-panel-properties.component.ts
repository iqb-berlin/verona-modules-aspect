import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { NgIf } from '@angular/common';
import { SharedModule } from 'common/shared.module';
import {
  HighlightPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/highlight-properties/highlight-properties.component';

@Component({
  selector: 'aspect-marking-panel-properties',
  imports: [
    NgIf,
    SharedModule,
    HighlightPropertiesComponent
  ],
  templateUrl: './marking-panel-properties.component.html'
})
export class MarkingPanelPropertiesComponent {
  @Input() combinedProperties!: any;
  @Output() updateModel =
    new EventEmitter<{
      property: string;
      value: string | number | boolean | string[], isInputValid?: boolean | null;
    }>();
}
