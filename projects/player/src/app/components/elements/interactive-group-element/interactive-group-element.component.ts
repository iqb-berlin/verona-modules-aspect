import {
  AfterViewInit, Component, ViewChild
} from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { ButtonElement, ButtonEvent, UnitNavParam } from 'common/models/elements/button/button';
import { FrameElement } from 'common/models/elements/frame/frame';
import { ImageElement } from 'common/models/elements/media-elements/image';
import { InputElementValue, ValueChangeElement } from 'common/models/elements/element';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';
import { AnchorService } from 'player/src/app/services/anchor.service';
import { NavigationService } from '../../../services/navigation.service';
import { ElementModelElementCodeMappingService } from '../../../services/element-model-element-code-mapping.service';
import { ElementGroupDirective } from '../../../directives/element-group.directive';
import { UnitStateService } from '../../../services/unit-state.service';

@Component({
  selector: 'aspect-interactive-group-element',
  templateUrl: './interactive-group-element.component.html',
  styleUrls: ['./interactive-group-element.component.scss']
})
export class InteractiveGroupElementComponent extends ElementGroupDirective implements AfterViewInit {
  @ViewChild('elementComponent') elementComponent!: ElementComponent;
  ButtonElement!: ButtonElement;
  FrameElement!: FrameElement;
  ImageElement!: ImageElement;

  constructor(
    public unitStateService: UnitStateService,
    public veronaPostService: VeronaPostService,
    public navigationService: NavigationService,
    private elementModelElementCodeMappingService: ElementModelElementCodeMappingService,
    private anchorService: AnchorService
  ) {
    super();
  }

  ngAfterViewInit(): void {
    const initialValue: InputElementValue = this.elementModel.type === 'image' ?
      this.elementModelElementCodeMappingService.mapToElementCodeValue(
        (this.elementModel as ImageElement).magnifierUsed, this.elementModel.type) :
      null;
    this.registerAtUnitStateService(
      this.elementModel.id,
      initialValue,
      this.elementComponent,
      this.pageIndex);
  }

  navigateTo(navigationEvent: ButtonEvent): void {
    switch (navigationEvent.action) {
      case 'unitNav':
        this.veronaPostService.sendVopUnitNavigationRequestedNotification(
          (navigationEvent.param as UnitNavParam)
        );
        break;
      case 'pageNav':
        this.navigationService.setPage(navigationEvent.param as number);
        break;
      case 'highlightText':
        this.anchorService.toggleAnchor(navigationEvent.param as string);
        break;
      case 'stateVariableChange':
        this.unitStateService.changeElementCodeValue(navigationEvent.param as ValueChangeElement);
        break;
      default:
    }
  }
}
