import {
  AfterViewInit, Component, OnDestroy, ViewChild
} from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';
import { WidgetType } from 'player/modules/verona/models/verona';
import { Subject } from 'rxjs';
import { ValueChangeElement, WidgetPeriodicTableCall } from 'common/interfaces';
import { WidgetPeriodicTableElement } from 'common/models/elements/widgets/widget-periodic-table';
import { UnitStateService } from '../../../services/unit-state.service';
import { ElementGroupDirective } from '../../../directives/element-group.directive';
import { ElementModelElementCodeMappingService } from '../../../services/element-model-element-code-mapping.service';

@Component({
  selector: 'aspect-widget-group-element',
  templateUrl: './widget-group-element.component.html',
  styleUrls: ['./widget-group-element.component.scss'],
  standalone: false
})
export class WidgetGroupElementComponent
  extends ElementGroupDirective implements AfterViewInit, OnDestroy {
  @ViewChild('elementComponent') elementComponent!: ElementComponent;
  WidgetPeriodicTableElement!: WidgetPeriodicTableElement;

  private ngUnsubscribe: Subject<void> = new Subject();

  constructor(
    public unitStateService: UnitStateService,
    public veronaPostService: VeronaPostService
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

  applyWidgetCallEvent(event: WidgetPeriodicTableCall): void {
    const isWidget = this.elementModel.type.startsWith('widget');
    if (isWidget) {
      let widgetType: WidgetType;
      switch (this.elementModel.type) {
        case 'widget-periodic-table':
          widgetType = 'periodic_table';
          break;
        default:
          return;
      }
      this.veronaPostService.sendVopWidgetCall({
        widgetType,
        parameters: Object.entries(event)
          .map(([key, value]) => ({ key, value: String(value) }))
      });
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
