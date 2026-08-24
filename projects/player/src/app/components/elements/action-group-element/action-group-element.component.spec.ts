/* eslint-disable max-classes-per-file */
import {
  Component, Directive, EventEmitter, Input, Output, Pipe, PipeTransform
} from '@angular/core';
import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { ElementComponent } from 'common/directives/element-component.directive';
import { ButtonElement, ButtonEvent } from 'common/models/elements/action-group-elements/button';
import { TriggerActionEvent, TriggerElement } from 'common/models/elements/action-group-elements/trigger';
import { UIElement } from 'common/models/elements/element';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';
import { AnchorService } from 'player/src/app/services/anchor.service';
import { NavigationService } from 'player/src/app/services/navigation.service';
import { StateVariableStateService } from 'player/src/app/services/state-variable-state.service';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import { CastPipe } from 'player/src/app/pipes/cast.pipe';
import { ActionGroupElementComponent } from './action-group-element.component';

@Pipe({
  name: 'isEnabledNavigationTarget',
  standalone: false
})
class MockIsEnabledNavigationTarget implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(): boolean {
    return true;
  }
}

@Component({
  selector: 'aspect-button',
  template: '',
  standalone: false
})
class ButtonStubComponent extends ElementComponent {
  @Input() elementModel!: ButtonElement;
  @Output() buttonActionEvent = new EventEmitter<ButtonEvent>();
}

@Component({
  selector: 'aspect-trigger',
  template: '',
  standalone: false
})
class TriggerStubComponent extends ElementComponent {
  @Input() elementModel!: TriggerElement;
  @Output() triggerActionEvent = new EventEmitter<TriggerActionEvent>();
  emitEvent = vi.fn();
}

@Directive({
  selector: '[aspectInViewDetection]',
  standalone: false
})
class MockInViewDetectionDirective {
  @Input() detectionType!: 'top' | 'bottom';
  @Output() intersecting = new EventEmitter();
}

describe('ActionGroupElementComponent', () => {
  let component: ActionGroupElementComponent;
  let fixture: ComponentFixture<ActionGroupElementComponent>;
  let unitStateService: SpyObj<UnitStateService>;
  let veronaPostService: SpyObj<VeronaPostService>;
  let navigationService: SpyObj<NavigationService>;
  let anchorService: SpyObj<AnchorService>;
  let stateVariableStateService: SpyObj<StateVariableStateService>;

  const initComponent = (elementModel: UIElement): void => {
    fixture = TestBed.createComponent(ActionGroupElementComponent);
    component = fixture.componentInstance;
    component.elementModel = elementModel;
    component.pageIndex = 1;
    fixture.detectChanges();
  };

  const createButton = (): ButtonElement => new ButtonElement({ id: 'button_1', alias: 'button_1' });

  beforeEach(async () => {
    unitStateService = createSpyObj<UnitStateService>(['registerElementCode', 'changeElementCodeValue']);
    veronaPostService = createSpyObj<VeronaPostService>(['sendVopUnitNavigationRequestedNotification']);
    navigationService = Object.assign(
      createSpyObj<NavigationService>(['setPage']),
      { enabledNavigationTargets: new BehaviorSubject<string[]>(['next']) }
    );
    anchorService = createSpyObj<AnchorService>(['toggleAnchor', 'showAnchor', 'hideAllAnchors']);
    stateVariableStateService = createSpyObj<StateVariableStateService>(['changeElementCodeValue']);

    await TestBed.configureTestingModule({
      declarations: [
        ActionGroupElementComponent,
        ButtonStubComponent,
        TriggerStubComponent,
        MockInViewDetectionDirective,
        MockIsEnabledNavigationTarget,
        CastPipe
      ],
      providers: [
        { provide: UnitStateService, useValue: unitStateService },
        { provide: VeronaPostService, useValue: veronaPostService },
        { provide: NavigationService, useValue: navigationService },
        { provide: AnchorService, useValue: anchorService },
        { provide: StateVariableStateService, useValue: stateVariableStateService }
      ]
    })
      .compileComponents();
  });

  it('should create', () => {
    initComponent(createButton());

    expect(component).toBeTruthy();
  });

  it('should show a button for a button element', () => {
    initComponent(createButton());

    expect(fixture.debugElement.query(By.directive(ButtonStubComponent))).toBeTruthy();
    expect(fixture.debugElement.query(By.directive(TriggerStubComponent))).toBeNull();
  });

  it('should show a trigger for a trigger element', () => {
    initComponent(new TriggerElement({ id: 'trigger_1', alias: 'trigger_1' }));

    expect(fixture.debugElement.query(By.directive(TriggerStubComponent))).toBeTruthy();
    expect(fixture.debugElement.query(By.directive(ButtonStubComponent))).toBeNull();
  });

  it('should register the element without a value at the unit state service', () => {
    const elementModel = createButton();
    elementModel.isRelevantForPresentationComplete = true;

    initComponent(elementModel);

    expect(unitStateService.registerElementCode)
      .toHaveBeenCalledWith('button_1', 'button_1', null, component.elementComponent.domElement, 1);
  });

  it('should request the unit navigation of the host', () => {
    initComponent(createButton());

    component.applyButtonAction({ action: 'unitNav', param: 'next' } as ButtonEvent);

    expect(veronaPostService.sendVopUnitNavigationRequestedNotification).toHaveBeenCalledWith('next');
  });

  it('should navigate to another page', () => {
    initComponent(createButton());

    component.applyButtonAction({ action: 'pageNav', param: 2 } as ButtonEvent);

    expect(navigationService.setPage).toHaveBeenCalledWith(2);
  });

  it('should toggle a text highlight', () => {
    initComponent(createButton());

    component.applyButtonAction({ action: 'highlightText', param: 'anchor_1' } as ButtonEvent);

    expect(anchorService.toggleAnchor).toHaveBeenCalledWith('anchor_1');
  });

  it('should treat unknown button actions as trigger actions', () => {
    initComponent(createButton());

    component.applyButtonAction({ action: 'removeHighlights', param: null } as unknown as ButtonEvent);

    expect(anchorService.hideAllAnchors).toHaveBeenCalled();
  });

  it('should show a highlight for a trigger action', fakeAsync(() => {
    initComponent(createButton());

    component.applyTriggerAction({ action: 'highlightText', param: 'anchor_1' } as TriggerActionEvent);
    tick();

    expect(anchorService.showAnchor).toHaveBeenCalledWith('anchor_1');
  }));

  it('should change a state variable for a trigger action', () => {
    initComponent(createButton());

    component.applyTriggerAction({
      action: 'stateVariableChange', param: { id: 'state_1', value: '1' }
    } as unknown as TriggerActionEvent);

    expect(stateVariableStateService.changeElementCodeValue)
      .toHaveBeenCalledWith({ id: 'state_1', value: '1' });
  });

  it('should ignore unknown trigger actions', () => {
    initComponent(createButton());

    component.applyTriggerAction({ action: 'unknown', param: null } as unknown as TriggerActionEvent);

    expect(anchorService.showAnchor).not.toHaveBeenCalled();
    expect(anchorService.hideAllAnchors).not.toHaveBeenCalled();
    expect(stateVariableStateService.changeElementCodeValue).not.toHaveBeenCalled();
  });

  it('should apply a button action reported by the button', () => {
    initComponent(createButton());
    const applyButtonAction = vi.spyOn(component, 'applyButtonAction');
    const buttonEvent = { action: 'pageNav', param: 1 } as ButtonEvent;

    (fixture.debugElement.query(By.directive(ButtonStubComponent))
      .componentInstance as ButtonStubComponent).buttonActionEvent.emit(buttonEvent);

    expect(applyButtonAction).toHaveBeenCalledWith(buttonEvent);
  });

  it('should report changed element values to the unit state service', () => {
    initComponent(createButton());

    component.changeElementCodeValue({ id: 'button_1', value: 'clicked' });

    expect(unitStateService.changeElementCodeValue)
      .toHaveBeenCalledWith({ id: 'button_1', value: 'clicked' });
  });
});
