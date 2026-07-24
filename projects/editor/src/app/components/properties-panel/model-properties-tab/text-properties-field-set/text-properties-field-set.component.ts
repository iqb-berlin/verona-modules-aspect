import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SharedModule } from 'common/shared.module';
import { TextElement } from 'common/models/elements/text-group-elements/text';
import { UnitService } from 'editor/src/app/services/unit.service';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import {
  HighlightPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/highlight-properties/highlight-properties.component';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { DialogService } from 'editor/src/app/services/dialog.service';

@Component({
  selector: 'aspect-text-props',
  imports: [
    NgIf,
    SharedModule,
    MatInputModule,
    MatCheckboxModule,
    MatOptionModule,
    MatSelectModule,
    HighlightPropertiesComponent
  ],
  templateUrl: './text-properties-field-set.component.html',
  styleUrls: ['./text-properties-field-set.component.scss']
})
export class TextPropsComponent {
  markingPanelIDs: [string, string][];
  @Input() combinedProperties!: any;
  @Output() updateModel =
    new EventEmitter<{
      property: string;
      value: string | number | boolean | string[],
      isInputValid?: boolean | null
    }>();

  constructor(public unitService: UnitService,
              public dialogService: DialogService,
              public selectionService: SelectionService) {
    this.markingPanelIDs = this.unitService.unit.getAllElements('marking-panel')
      .map(element => [element.id, element.alias]);
  }

  showTextEditDialog(): void {
    const selectedElement = this.selectionService.getSelectedElements()[0];
    this.dialogService.showRichTextEditDialog(
      (selectedElement as TextElement).text,
      (selectedElement as TextElement).styling.fontSize
    ).subscribe((result: string) => {
      if (result) {
        this.updateModel.emit({ property: 'text', value: result });
      }
    });
  }

  toggleConnectedMarkingPanels(markingPanels: string[]) {
    this.updateModel.emit({
      property: 'markingPanels',
      value: [...markingPanels]
    });
  }
}
