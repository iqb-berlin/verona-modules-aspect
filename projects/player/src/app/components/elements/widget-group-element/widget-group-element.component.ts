import {
  AfterViewInit, Component, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';
import { VeronaSubscriptionService } from 'player/modules/verona/services/verona-subscription.service';
import { VopWidgetReturn, WidgetType } from 'player/modules/verona/models/verona';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ValueChangeElement } from 'common/models/input-element-interfaces';
import { WidgetPeriodicTableCall, WidgetMoleculeEditorCall } from 'common/models/widget-interfaces';
import { WidgetPeriodicTableElement } from 'common/models/elements/widget-periodic-table';
import {
  WidgetMoleculeEditorElement
} from 'common/models/elements/widget-molecule-editor';
import { StringUtils } from 'player/src/app/classes/string-utils';
import { SharedParametersService } from 'player/src/app/services/shared-parameters.service';
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
  WidgetMoleculeEditorElement!: WidgetMoleculeEditorElement;

  private ngUnsubscribe: Subject<void> = new Subject();
  private widgetReturnSubscription?: Subscription;
  private currentCallId?: string;

  constructor(
    public unitStateService: UnitStateService,
    public veronaPostService: VeronaPostService,
    private veronaSubscriptionService: VeronaSubscriptionService,
    private elementModelElementCodeMappingService: ElementModelElementCodeMappingService,
    private translateService: TranslateService,
    private sharedParametersService: SharedParametersService
  ) {
    super();
  }

  ngOnInit(): void {
    const mappedValue = this.elementModelElementCodeMappingService
      .mapToElementModelValue(
        this.unitStateService.getElementCodeById(this.elementModel.id)?.value, this.elementModel
      );
    (this.elementModel as WidgetPeriodicTableElement | WidgetMoleculeEditorElement).state =
      mappedValue as string | null;
  }

  ngAfterViewInit(): void {
    const initialValue = ElementModelElementCodeMappingService.mapToElementCodeValue(
      (this.elementModel as WidgetPeriodicTableElement | WidgetMoleculeEditorElement).state,
      this.elementModel.type);
    this.registerAtUnitStateService(
      this.elementModel.id,
      this.elementModel.alias,
      initialValue,
      this.elementComponent,
      this.pageIndex);
  }

  applyWidgetCall(
    event: WidgetPeriodicTableCall | WidgetMoleculeEditorCall, widgetType: WidgetType
  ): void {
    this.currentCallId = `${this.elementModel.alias}-${crypto.randomUUID()}`;
    this.sendWidgetCallEvent(event, widgetType);
    this.subscribeToWidgetReturn();
  }

  private sendWidgetCallEvent(
    event: WidgetPeriodicTableCall | WidgetMoleculeEditorCall, widgetType: WidgetType
  ): void {
    const currentState =
      (this.elementModel as WidgetPeriodicTableElement | WidgetMoleculeEditorElement).state;
    const sharedParameters = WidgetGroupElementComponent.toKeyValues(event.sharedParameters);

    // The host keeps a shared value until it is overwritten, and only one widget is open at a time:
    // shared before every call, the values of this element are the ones its widget starts with.
    this.sharedParametersService.share(sharedParameters);
    this.veronaPostService.sendVopWidgetCall({
      callId: this.currentCallId,
      widgetType,
      parameters: [
        ...WidgetGroupElementComponent.toKeyValues(event.parameters),
        // The widget's language is the player's, not a setting of the task (#1420).
        { key: 'LANGUAGE', value: this.translateService.currentLang ?? this.translateService.defaultLang }
      ],
      // Not a field of vopWidgetCall in the player API. The studio hands the widget only the shared
      // values of the call, not the ones it collected from the player state (studio-lite#1689).
      sharedParameters,
      ...(currentState ?
        { state: currentState as string } : {})
    });
  }

  private static toKeyValues(values: object): { key: string; value: string }[] {
    return Object.entries(values)
      .map(([key, value]) => ({ key: StringUtils.camelCaseToUpperSnakeCase(key), value: String(value) }));
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
    if (message.callId !== this.currentCallId) return;
    this.currentCallId = undefined;
    /* `state` is an optional string in the Verona spec, and it arrives by postMessage unchecked. An
       empty one is a state like any other: the periodic table sends '' once every symbol is
       deselected. A return that brings the state it was called with changes nothing, and an unset
       state counts as '' for that -- confirming an unanswered widget without choosing anything keeps
       it unanswered (#1465). */
    const previousState =
      (this.elementModel as WidgetPeriodicTableElement | WidgetMoleculeEditorElement).state ?? '';
    if (typeof message.state === 'string' && message.state !== previousState) {
      (this.elementModel as WidgetPeriodicTableElement | WidgetMoleculeEditorElement).state =
        message.state;

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
