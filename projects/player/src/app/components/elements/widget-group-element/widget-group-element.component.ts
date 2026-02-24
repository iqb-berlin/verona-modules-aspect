import {
  AfterViewInit, Component, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';
import { VeronaSubscriptionService } from 'player/modules/verona/services/verona-subscription.service';
import { VopWidgetReturn, WidgetType } from 'player/modules/verona/models/verona';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ValueChangeElement, WidgetCalcCall, WidgetPeriodicTableCall } from 'common/interfaces';
import { WidgetPeriodicTableElement } from 'common/models/elements/widget-periodic-table/widget-periodic-table';
import { WidgetCalcElement } from 'common/models/elements/widget-calc/widget-calc';
import { StringUtils } from 'player/src/app/classes/string-utils';
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
  extends ElementGroupDirective implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('elementComponent') elementComponent!: ElementComponent;
  WidgetPeriodicTableElement!: WidgetPeriodicTableElement;
  WidgetCalcElement!: WidgetCalcElement;

  private ngUnsubscribe: Subject<void> = new Subject();
  private widgetReturnSubscription?: Subscription;

  constructor(
    public unitStateService: UnitStateService,
    public veronaPostService: VeronaPostService,
    private veronaSubscriptionService: VeronaSubscriptionService,
    private elementModelElementCodeMappingService: ElementModelElementCodeMappingService
  ) {
    super();
  }

  ngOnInit(): void {
    if (this.isWidgetElement()) {
      const mappedValue = this.elementModelElementCodeMappingService
        .mapToElementModelValue(
          this.unitStateService.getElementCodeById(this.elementModel.id)?.value, this.elementModel
        );
      (this.elementModel as WidgetPeriodicTableElement | WidgetCalcElement).state = mappedValue as string | null;
    }
  }

  ngAfterViewInit(): void {
    let initialValue = null;
    if (this.isWidgetElement()) {
      initialValue = ElementModelElementCodeMappingService.mapToElementCodeValue(
        (this.elementModel as WidgetPeriodicTableElement | WidgetCalcElement).state, this.elementModel.type);
    }
    this.registerAtUnitStateService(
      this.elementModel.id,
      this.elementModel.alias,
      initialValue,
      this.elementComponent,
      this.pageIndex);
  }

  applyWidgetCall(event: WidgetPeriodicTableCall | WidgetCalcCall, widgetType: WidgetType): void {
    if (!this.isWidgetElement()) return;

    this.sendWidgetCallEvent(event, widgetType);
    this.subscribeToWidgetReturn();
  }

  private isWidgetElement(): boolean {
    return this.elementModel.type.startsWith('widget');
  }

  private sendWidgetCallEvent(event: WidgetPeriodicTableCall | WidgetCalcCall, widgetType: WidgetType): void {
    const currentState = (this.elementModel as WidgetPeriodicTableElement | WidgetCalcElement).state;

    this.veronaPostService.sendVopWidgetCall({
      widgetType,
      parameters: Object.entries(event)
        .map(([key, value]) => ({ key: StringUtils.camelCaseToUpperSnakeCase(key), value: String(value) })),
      ...(currentState ?
        { state: currentState as string } : {})
    });
  }

  private subscribeToWidgetReturn(): void {
    if (this.widgetReturnSubscription) {
      this.widgetReturnSubscription.unsubscribe();
    }
    this.widgetReturnSubscription = this.veronaSubscriptionService.vopWidgetReturn
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((message: VopWidgetReturn) => {
        this.handleWidgetReturnMessage(message);
      });
  }

  private handleWidgetReturnMessage(message: VopWidgetReturn): void {
    if (message.state) {
      if (this.isWidgetElement()) {
        (this.elementModel as WidgetPeriodicTableElement | WidgetCalcElement).state = message.state;
      }

      this.changeElementCodeValue({
        id: this.elementModel.id,
        value: message.state
      });
    }
    this.widgetReturnSubscription?.unsubscribe();
    this.widgetReturnSubscription = undefined;
  }

  changeElementCodeValue(value: ValueChangeElement): void {
    this.unitStateService.changeElementCodeValue({
      id: value.id,
      value: ElementModelElementCodeMappingService
        .mapToElementCodeValue(value.value, this.elementModel.type)
    });
  }

  ngOnDestroy(): void {
    if (this.widgetReturnSubscription) {
      this.widgetReturnSubscription.unsubscribe();
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
