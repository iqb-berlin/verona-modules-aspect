import { fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject, Subject } from 'rxjs';
import { Response } from '@iqb/responses';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { Progress } from 'player/modules/verona/models/verona';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';
import { VeronaSubscriptionService } from 'player/modules/verona/services/verona-subscription.service';
import { GeometryVariableStateService } from 'player/src/app/services/geometry-variable-state.service';
import { MediaPlayerService } from 'player/src/app/services/media-player.service';
import { StateVariableStateService } from 'player/src/app/services/state-variable-state.service';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import { ValidationService } from 'player/src/app/services/validation.service';
import { UnitStateDirective } from './unit-state.directive';

/*
 * The directive has no template of its own. It is instantiated directly instead of through a
 * host component, so that the debounced state subscriptions are set up inside the test's
 * fakeAsync zone and stay visible for tick().
 */
describe('UnitStateDirective', () => {
  let directive: UnitStateDirective;
  let unitStateService: SpyObj<UnitStateService> & { elementCodeChanged: Subject<Response> };
  let stateVariableStateService: SpyObj<StateVariableStateService> & { elementCodeChanged: Subject<Response> };
  let geometryVariableStateService: SpyObj<GeometryVariableStateService> & { elementCodeChanged: Subject<Response> };
  let mediaPlayerService: SpyObj<MediaPlayerService> & { mediaStatusChanged: Subject<string> };
  let validationService: SpyObj<ValidationService>;
  let veronaPostService: SpyObj<VeronaPostService>;
  let pagePresented: Subject<number>;

  const lastUnitState = () => {
    const calls = veronaPostService.sendVopStateChangedNotification.mock.calls;
    return calls[calls.length - 1][0].unitState;
  };

  const initDirective = (): void => {
    directive.presentationProgressStatus = new BehaviorSubject<Progress>('none');
    directive.ngOnInit();
  };

  beforeEach(() => {
    pagePresented = new Subject<number>();
    unitStateService = Object.assign(
      createSpyObj<UnitStateService>(['getResponses', 'reset']),
      { elementCodeChanged: new Subject<Response>(), pagePresented: pagePresented.asObservable() }
    );
    unitStateService.getResponses.mockReturnValue([{ id: 'alias_1', status: 'VALUE_CHANGED', value: 'a' }]);
    Object.defineProperty(unitStateService, 'presentedPagesProgress', { value: 'some', writable: true });

    stateVariableStateService = Object.assign(
      createSpyObj<StateVariableStateService>(['getResponses', 'reset']),
      { elementCodeChanged: new Subject<Response>() }
    );
    stateVariableStateService.getResponses.mockReturnValue([]);

    geometryVariableStateService = Object.assign(
      createSpyObj<GeometryVariableStateService>(['getResponses', 'reset']),
      { elementCodeChanged: new Subject<Response>() }
    );
    geometryVariableStateService.getResponses.mockReturnValue([]);

    mediaPlayerService = Object.assign(
      createSpyObj<MediaPlayerService>(['areMediaElementsRegistered', 'reset']),
      { mediaStatusChanged: new Subject<string>() }
    );
    mediaPlayerService.areMediaElementsRegistered.mockReturnValue(false);

    validationService = createSpyObj<ValidationService>(['reset']);
    Object.defineProperty(validationService, 'responseProgress', { value: 'some', writable: true });

    veronaPostService = createSpyObj<VeronaPostService>(['sendVopStateChangedNotification']);

    directive = new UnitStateDirective(
      unitStateService,
      stateVariableStateService,
      geometryVariableStateService,
      mediaPlayerService,
      {} as VeronaSubscriptionService,
      veronaPostService,
      validationService
    );
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should send the collected responses as unit state', fakeAsync(() => {
    initDirective();

    unitStateService.elementCodeChanged.next({ id: 'text-field_1', status: 'VALUE_CHANGED', value: 'a' });
    tick(100);

    expect(lastUnitState()?.dataParts.elementCodes)
      .toBe(JSON.stringify([{ id: 'alias_1', status: 'VALUE_CHANGED', value: 'a' }]));
    expect(lastUnitState()?.unitStateDataType).toBe('iqb-standard@1.0');
    expect(lastUnitState()?.responseProgress).toBe('some');
    directive.ngOnDestroy();
  }));

  it('should react on every state source', fakeAsync(() => {
    initDirective();
    tick(100);
    veronaPostService.sendVopStateChangedNotification.mockClear();

    stateVariableStateService.elementCodeChanged.next({ id: 's1', status: 'VALUE_CHANGED', value: 1 });
    tick(100);
    geometryVariableStateService.elementCodeChanged.next({ id: 'g1', status: 'VALUE_CHANGED', value: 1 });
    tick(100);
    mediaPlayerService.mediaStatusChanged.next('audio_1');
    tick(100);
    pagePresented.next(1);
    tick(100);

    expect(veronaPostService.sendVopStateChangedNotification).toHaveBeenCalledTimes(4);
    directive.ngOnDestroy();
  }));

  it('should debounce fast state changes', fakeAsync(() => {
    initDirective();

    unitStateService.elementCodeChanged.next({ id: 'text-field_1', status: 'VALUE_CHANGED', value: 'a' });
    unitStateService.elementCodeChanged.next({ id: 'text-field_1', status: 'VALUE_CHANGED', value: 'ab' });
    tick(100);

    expect(veronaPostService.sendVopStateChangedNotification).toHaveBeenCalledTimes(1);
    directive.ngOnDestroy();
  }));

  it('should report the presentation progress of the presented pages', fakeAsync(() => {
    initDirective();

    unitStateService.elementCodeChanged.next({ id: 'text-field_1', status: 'VALUE_CHANGED', value: 'a' });
    tick(100);

    expect(lastUnitState()?.presentationProgress).toBe('some');
    directive.ngOnDestroy();
  }));

  it('should keep a complete presentation progress', fakeAsync(() => {
    directive.presentationProgressStatus = new BehaviorSubject<Progress>('complete');
    directive.ngOnInit();

    unitStateService.elementCodeChanged.next({ id: 'text-field_1', status: 'VALUE_CHANGED', value: 'a' });
    tick(100);

    expect(lastUnitState()?.presentationProgress).toBe('complete');
    directive.ngOnDestroy();
  }));

  it('should send the unit state when the host window is unloaded', () => {
    initDirective();
    veronaPostService.sendVopStateChangedNotification.mockClear();

    directive.onUnload();

    expect(veronaPostService.sendVopStateChangedNotification).toHaveBeenCalledTimes(1);
  });

  it('should send a last unit state and reset all services on destruction', () => {
    initDirective();
    veronaPostService.sendVopStateChangedNotification.mockClear();

    directive.ngOnDestroy();

    expect(veronaPostService.sendVopStateChangedNotification).toHaveBeenCalledTimes(1);
    expect(unitStateService.reset).toHaveBeenCalled();
    expect(stateVariableStateService.reset).toHaveBeenCalled();
    expect(geometryVariableStateService.reset).toHaveBeenCalled();
    expect(mediaPlayerService.reset).toHaveBeenCalled();
    expect(validationService.reset).toHaveBeenCalled();
  });

  it('should stop reacting on state changes after destruction', fakeAsync(() => {
    initDirective();
    directive.ngOnDestroy();
    veronaPostService.sendVopStateChangedNotification.mockClear();

    unitStateService.elementCodeChanged.next({ id: 'text-field_1', status: 'VALUE_CHANGED', value: 'a' });
    tick(100);

    expect(veronaPostService.sendVopStateChangedNotification).not.toHaveBeenCalled();
  }));
});
