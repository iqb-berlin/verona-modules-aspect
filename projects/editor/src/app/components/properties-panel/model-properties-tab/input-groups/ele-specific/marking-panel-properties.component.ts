import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { NgIf } from '@angular/common';
import { SharedModule } from 'common/shared.module';
import {
  HighlightPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/input-groups/highlight-properties.component';

@Component({
  selector: 'aspect-marking-panel-properties',
  standalone: true,
  imports: [
    NgIf,
    SharedModule,
    HighlightPropertiesComponent
  ],
  template: `
    <div *ngIf="combinedProperties.type === 'marking-panel'" class="fx-column-start-stretch">
      Fernsteuerung
      <fieldset class="fx-column-start-stretch">
        <legend>{{'propertiesPanel.marking' | translate }}</legend>
        <aspect-highlight-properties [combinedProperties]="combinedProperties"
                                     [disabled]="false"
                                     (updateModel)="updateModel.emit($event)">
        </aspect-highlight-properties>
      </fieldset>
    </div>
  `,
  styles: [`
  `]
})
export class MarkingPanelPropertiesComponent {
  @Input() combinedProperties!: any;
  @Output() updateModel =
    new EventEmitter<{
      property: string;
      value: string | number | boolean | string[], isInputValid?: boolean | null;
    }>();
}
