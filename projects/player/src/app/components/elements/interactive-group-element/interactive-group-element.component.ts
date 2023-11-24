import {
  AfterViewInit, Component, OnInit, ViewChild
} from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { ButtonElement, ButtonEvent, UnitNavParam } from 'common/models/elements/button/button';
import { ImageElement } from 'common/models/elements/media-elements/image';
import { ValueChangeElement } from 'common/models/elements/element';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';
import { AnchorService } from 'player/src/app/services/anchor.service';
import { StateVariableStateService } from 'player/src/app/services/state-variable-state.service';
import { MathTableElement, MathTableRow } from 'common/models/elements/input-elements/math-table';
import { NavigationService } from '../../../services/navigation.service';
import { ElementModelElementCodeMappingService } from '../../../services/element-model-element-code-mapping.service';
import { ElementGroupDirective } from '../../../directives/element-group.directive';
import { UnitStateService } from '../../../services/unit-state.service';

@Component({
  selector: 'aspect-interactive-group-element',
  templateUrl: './interactive-group-element.component.html',
  styleUrls: ['./interactive-group-element.component.scss']
})
export class InteractiveGroupElementComponent extends ElementGroupDirective implements OnInit, AfterViewInit {
  @ViewChild('elementComponent') elementComponent!: ElementComponent;
  ButtonElement!: ButtonElement;
  ImageElement!: ImageElement;
  MathTableElement!: MathTableElement;

  tableModel: MathTableRow[] = [];

  constructor(
    public unitStateService: UnitStateService,
    public veronaPostService: VeronaPostService,
    public navigationService: NavigationService,
    private elementModelElementCodeMappingService: ElementModelElementCodeMappingService,
    private anchorService: AnchorService,
    private stateVariableStateService: StateVariableStateService
  ) {
    super();
  }

  ngOnInit(): void {
    if (this.elementModel.type === 'math-table') {
      this.tableModel = this.elementModelElementCodeMappingService.mapToElementModelValue(
        this.unitStateService.getElementCodeById(this.elementModel.id)?.value, this.elementModel
      ) as MathTableRow[];
    }
  }

  ngAfterViewInit(): void {
    let initialValue;
    switch (this.elementModel.type) {
      case 'image':
        initialValue = ElementModelElementCodeMappingService.mapToElementCodeValue(
          (this.elementModel as ImageElement).magnifierUsed, this.elementModel.type);
        break;
      case 'math-table':
        initialValue = ElementModelElementCodeMappingService.mapToElementCodeValue(
          [], this.elementModel.type);
        break;
      default:
        initialValue = null;
    }
    this.registerAtUnitStateService(
      this.elementModel.id,
      initialValue,
      this.elementComponent,
      this.pageIndex);
  }

  applyButtonAction(buttonEvent: ButtonEvent): void {
    switch (buttonEvent.action) {
      case 'unitNav':
        this.veronaPostService.sendVopUnitNavigationRequestedNotification(
          (buttonEvent.param as UnitNavParam)
        );
        break;
      case 'pageNav':
        this.navigationService.setPage(buttonEvent.param as number);
        break;
      case 'highlightText':
        this.anchorService.toggleAnchor(buttonEvent.param as string);
        break;
      case 'stateVariableChange':
        this.stateVariableStateService.changeElementCodeValue(
          buttonEvent.param as { id: string, value: string }
        );
        break;
      default:
    }
  }

  changeElementCodeValue(value: ValueChangeElement): void {
    this.unitStateService.changeElementCodeValue({
      id: value.id,
      value: ElementModelElementCodeMappingService
        .mapToElementCodeValue(value.value, this.elementModel.type)
    });
  }
}
