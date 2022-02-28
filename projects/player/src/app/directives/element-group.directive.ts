import { Directive, Input } from '@angular/core';
import { InputElementValue, UIElement } from '../../../../common/interfaces/elements';
import { UnitStateService } from '../services/unit-state.service';
import { ElementComponent } from '../../../../common/directives/element-component.directive';

@Directive()
export abstract class ElementGroupDirective {
  @Input() elementModel!: UIElement;
  @Input() pageIndex!: number;
  abstract unitStateService: UnitStateService;

  registerAtUnitStateService(
    id: string, value: InputElementValue, elementComponent: ElementComponent, pageIndex: number
  ): void {
    if (!this.unitStateService.isRegistered(id)) {
      this.unitStateService.registerElement(
        id, value, elementComponent.domElement, pageIndex
      );
    }
  }
}
