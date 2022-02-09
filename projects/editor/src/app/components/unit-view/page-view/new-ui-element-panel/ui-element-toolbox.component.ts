import { Component } from '@angular/core';
import { UnitService } from '../../../../services/unit.service';
import { SelectionService } from '../../../../services/selection.service';
import { UIElementType } from '../../../../../../../common/models/uI-element';

@Component({
  selector: 'app-ui-element-toolbox',
  templateUrl: './ui-element-toolbox.component.html',
  styleUrls: ['./ui-element-toolbox.component.css']
})
export class UiElementToolboxComponent {
  hoverRadioButton: boolean = false;
  constructor(private selectionService: SelectionService, public unitService: UnitService) { }

  async addUIElement(elementType: UIElementType): Promise<void> {
    this.unitService.addElementToSectionByIndex(elementType,
      this.selectionService.selectedPageIndex,
      this.selectionService.selectedPageSectionIndex);
  }
}
