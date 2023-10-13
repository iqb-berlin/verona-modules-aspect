import { Component } from '@angular/core';
import { UIElementType } from 'common/models/elements/element';
import { UnitService } from '../../services/unit.service';
import { SelectionService } from '../../services/selection.service';

@Component({
  selector: 'aspect-ui-element-toolbox',
  templateUrl: './ui-element-toolbox.component.html',
  styleUrls: ['./ui-element-toolbox.component.css']
})
export class UiElementToolboxComponent {
  hoverRadioButton: boolean = false;
  hoverFormulaButton: boolean = false;
  constructor(private selectionService: SelectionService, public unitService: UnitService) { }

  async addUIElement(elementType: UIElementType): Promise<void> {
    this.unitService.addElementToSectionByIndex(elementType,
      this.selectionService.selectedPageIndex,
      this.selectionService.selectedPageSectionIndex);
  }
}
