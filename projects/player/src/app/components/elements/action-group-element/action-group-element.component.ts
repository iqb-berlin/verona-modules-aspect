import {
  AfterViewInit, Component, OnDestroy, ViewChild
} from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { ButtonElement, ButtonEvent, UnitNavParam } from 'common/models/elements/button/button';
import { TriggerActionEvent, TriggerElement } from 'common/models/elements/trigger/trigger';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';
import { AnchorService } from 'player/src/app/services/anchor.service';
import { StateVariableStateService } from 'player/src/app/services/state-variable-state.service';
import { Subject } from 'rxjs';
import { ValueChangeElement } from 'common/interfaces';
import { UnitStateService } from '../../../services/unit-state.service';
import { ElementGroupDirective } from '../../../directives/element-group.directive';
import { ElementModelElementCodeMappingService } from '../../../services/element-model-element-code-mapping.service';
import { NavigationService } from '../../../services/navigation.service';

@Component({
  selector: 'aspect-action-group-element',
  templateUrl: './action-group-element.component.html',
  styleUrls: ['./action-group-element.component.scss'],
  standalone: false
})
export class ActionGroupElementComponent
  extends ElementGroupDirective implements AfterViewInit, OnDestroy {
  @ViewChild('elementComponent') elementComponent!: ElementComponent;
  ButtonElement!: ButtonElement;
  TriggerElement!: TriggerElement;

  private ngUnsubscribe: Subject<void> = new Subject();

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

  ngAfterViewInit(): void {
    this.registerAtUnitStateService(
      this.elementModel.id,
      this.elementModel.alias,
      null,
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
      default:
        this.applyTriggerAction(buttonEvent as TriggerActionEvent);
    }
  }

  applyTriggerAction(triggerActionEvent: TriggerActionEvent): void {
    switch (triggerActionEvent.action) {
      case 'highlightText':
        this.anchorService.showAnchor(triggerActionEvent.param as string);
        break;
      case 'removeHighlights':
        this.anchorService.hideAllAnchors();
        break;
      case 'stateVariableChange':
        this.stateVariableStateService.changeElementCodeValue(
          triggerActionEvent.param as { id: string, value: string }
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

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
