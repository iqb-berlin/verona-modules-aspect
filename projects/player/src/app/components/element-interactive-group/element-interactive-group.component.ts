import {
  AfterViewInit, Component, ViewChild
} from '@angular/core';
import {
  ButtonElement, FrameElement, ImageElement
} from 'common/interfaces/elements';
import { VeronaPostService } from '../../../../modules/verona/services/verona-post.service';
import { UnitStateService } from '../../services/unit-state.service';
import { ElementGroupDirective } from '../../directives/element-group.directive';
import { ElementComponent } from 'common/directives/element-component.directive';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'aspect-element-interactive-group',
  templateUrl: './element-interactive-group.component.html',
  styleUrls: ['./element-interactive-group.component.scss']
})
export class ElementInteractiveGroupComponent extends ElementGroupDirective implements AfterViewInit {
  @ViewChild('elementComponent') elementComponent!: ElementComponent;
  ButtonElement!: ButtonElement;
  FrameElement!: FrameElement;
  ImageElement!: ImageElement;

  constructor(
    public unitStateService: UnitStateService,
    public veronaPostService: VeronaPostService,
    public navigationService: NavigationService
  ) {
    super();
  }

  ngAfterViewInit(): void {
    const initialValue = this.elementModel.type === 'image' ?
      (this.elementModel as ImageElement).magnifierUsed :
      null;
    this.registerAtUnitStateService(this.elementModel.id, initialValue, this.elementComponent, this.pageIndex);
  }
}
