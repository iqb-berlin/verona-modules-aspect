import { ElementRef } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { Response } from '@iqb/responses';
import { Section } from 'common/models/section';
import { VisibilityRule } from 'common/models/visibility-rule';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { IsVisibleIndex } from 'player/src/app/models/is-visible-index.interface';
import { StateVariableStateService } from 'player/src/app/services/state-variable-state.service';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import { SectionVisibilityHandlingDirective } from './section-visibility-handling.directive';

/*
 * The directive is instantiated directly instead of through a host component, so that the
 * timers it schedules stay visible for tick() and the host element can be inspected easily.
 */
describe('SectionVisibilityHandlingDirective', () => {
  let directive: SectionVisibilityHandlingDirective;
  let hostElement: HTMLElement;
  let unitStateService: SpyObj<UnitStateService> & { elementCodeChanged: Subject<Response> };
  let stateVariableStateService: SpyObj<StateVariableStateService> & { elementCodeChanged: Subject<Response> };
  let emittedVisibilities: IsVisibleIndex[];
  let elementCodes: Record<string, Response>;

  const createSection = (rules: VisibilityRule[], properties: Partial<Section> = {}): Section => {
    const section = new Section();
    section.visibilityRules = rules;
    Object.assign(section, properties);
    return section;
  };

  const initDirective = (section: Section): void => {
    directive.section = section;
    directive.pageIndex = 0;
    directive.sectionIndex = 1;
    directive.isVisibleIndexChange.subscribe(event => emittedVisibilities.push(event));
    directive.ngOnInit();
  };

  beforeEach(() => {
    hostElement = document.createElement('div');
    emittedVisibilities = [];
    elementCodes = {};

    unitStateService = Object.assign(
      createSpyObj<UnitStateService>(['getElementCodeById']),
      { elementCodeChanged: new Subject<Response>() }
    );
    unitStateService.getElementCodeById.mockImplementation((id: string) => elementCodes[id]);

    stateVariableStateService = Object.assign(
      createSpyObj<StateVariableStateService>(['getElementCodeById', 'registerElementCode', 'changeElementCodeValue']),
      { elementCodeChanged: new Subject<Response>() }
    );
    stateVariableStateService.getElementCodeById.mockReturnValue(undefined);

    directive = new SectionVisibilityHandlingDirective(
      new ElementRef(hostElement),
      unitStateService,
      stateVariableStateService
    );
  });

  afterEach(() => {
    directive.ngOnDestroy();
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should show a section without visibility rules', fakeAsync(() => {
    initDirective(createSection([]));

    tick();

    expect(emittedVisibilities).toEqual([{ index: 1, isVisible: true }]);
  }));

  it('should show a section whose rule is fulfilled right away', () => {
    elementCodes['text-field_1'] = { id: 'text-field_1', status: 'VALUE_CHANGED', value: 'yes' };

    initDirective(createSection([{ id: 'text-field_1', operator: '=', value: 'yes' }], { enableReHide: true }));

    expect(hostElement.style.display).toBe('unset');
    expect(emittedVisibilities).toEqual([{ index: 1, isVisible: true }]);
  });

  it('should hide a section whose rule is not fulfilled', () => {
    elementCodes['text-field_1'] = { id: 'text-field_1', status: 'VALUE_CHANGED', value: 'no' };

    initDirective(createSection([{ id: 'text-field_1', operator: '=', value: 'yes' }], { enableReHide: true }));

    expect(hostElement.style.display).toBe('none');
    expect(emittedVisibilities).toEqual([{ index: 1, isVisible: false }]);
  });

  it('should hide a section whose rule refers to an unknown element', () => {
    initDirective(createSection([{ id: 'unknown', operator: '=', value: 'yes' }], { enableReHide: true }));

    expect(emittedVisibilities).toEqual([{ index: 1, isVisible: false }]);
  });

  it('should show the section as soon as a rule becomes fulfilled', () => {
    elementCodes['text-field_1'] = { id: 'text-field_1', status: 'VALUE_CHANGED', value: 'no' };
    initDirective(createSection([{ id: 'text-field_1', operator: '=', value: 'yes' }], { enableReHide: true }));

    elementCodes['text-field_1'] = { id: 'text-field_1', status: 'VALUE_CHANGED', value: 'yes' };
    unitStateService.elementCodeChanged.next(elementCodes['text-field_1']);

    expect(hostElement.style.display).toBe('unset');
    expect(emittedVisibilities[emittedVisibilities.length - 1]).toEqual({ index: 1, isVisible: true });
  });

  it('should ignore changes of elements that are not part of a rule', () => {
    elementCodes['text-field_1'] = { id: 'text-field_1', status: 'VALUE_CHANGED', value: 'no' };
    initDirective(createSection([{ id: 'text-field_1', operator: '=', value: 'yes' }], { enableReHide: true }));

    unitStateService.elementCodeChanged.next({ id: 'other', status: 'VALUE_CHANGED', value: 'yes' });

    expect(emittedVisibilities.length).toBe(1);
  });

  it('should evaluate all rule operators', () => {
    const isFulfilled = (rule: VisibilityRule, value: string | number): boolean => {
      emittedVisibilities = [];
      elementCodes[rule.id] = { id: rule.id, status: 'VALUE_CHANGED', value };
      const ruleDirective = new SectionVisibilityHandlingDirective(
        new ElementRef(document.createElement('div')), unitStateService, stateVariableStateService
      );
      ruleDirective.section = createSection([rule], { enableReHide: true });
      ruleDirective.pageIndex = 0;
      ruleDirective.sectionIndex = 1;
      ruleDirective.isVisibleIndexChange.subscribe(event => emittedVisibilities.push(event));
      ruleDirective.ngOnInit();
      ruleDirective.ngOnDestroy();
      return emittedVisibilities[0].isVisible;
    };

    expect(isFulfilled({ id: 'e', operator: '=', value: '3' }, 3)).toBe(true);
    expect(isFulfilled({ id: 'e', operator: '≠', value: '3' }, 4)).toBe(true);
    expect(isFulfilled({ id: 'e', operator: '>', value: '3' }, 4)).toBe(true);
    expect(isFulfilled({ id: 'e', operator: '<', value: '3' }, 4)).toBe(false);
    expect(isFulfilled({ id: 'e', operator: '≥', value: '3' }, 3)).toBe(true);
    expect(isFulfilled({ id: 'e', operator: '≤', value: '3' }, 4)).toBe(false);
    expect(isFulfilled({ id: 'e', operator: 'contains', value: 'ei' }, 'Meine Antwort')).toBe(true);
    expect(isFulfilled({ id: 'e', operator: 'pattern', value: '[0-9]+' }, '123')).toBe(true);
    expect(isFulfilled({ id: 'e', operator: 'pattern', value: '[0-9]+' }, '12a')).toBe(false);
    expect(isFulfilled({ id: 'e', operator: 'minLength', value: '3' }, 'abc')).toBe(true);
    expect(isFulfilled({ id: 'e', operator: 'maxLength', value: '3' }, 'abcd')).toBe(false);
  });

  it('should require all rules for a conjunction', () => {
    elementCodes.a = { id: 'a', status: 'VALUE_CHANGED', value: '1' };
    elementCodes.b = { id: 'b', status: 'VALUE_CHANGED', value: '2' };

    initDirective(createSection(
      [{ id: 'a', operator: '=', value: '1' }, { id: 'b', operator: '=', value: '99' }],
      { enableReHide: true, logicalConnectiveOfRules: 'conjunction' }
    ));

    expect(emittedVisibilities).toEqual([{ index: 1, isVisible: false }]);
  });

  it('should require only one rule for a disjunction', () => {
    elementCodes.a = { id: 'a', status: 'VALUE_CHANGED', value: '1' };
    elementCodes.b = { id: 'b', status: 'VALUE_CHANGED', value: '2' };

    initDirective(createSection(
      [{ id: 'a', operator: '=', value: '1' }, { id: 'b', operator: '=', value: '99' }],
      { enableReHide: true, logicalConnectiveOfRules: 'disjunction' }
    ));

    expect(emittedVisibilities).toEqual([{ index: 1, isVisible: true }]);
  });

  it('should store the visibility as state variable for sections that cannot be hidden again', () => {
    elementCodes['text-field_1'] = { id: 'text-field_1', status: 'VALUE_CHANGED', value: 'yes' };

    initDirective(createSection([{ id: 'text-field_1', operator: '=', value: 'yes' }]));

    expect(stateVariableStateService.registerElementCode)
      .toHaveBeenCalledWith('section-0-1', 'section-0-1', 0);
    expect(stateVariableStateService.changeElementCodeValue)
      .toHaveBeenCalledWith({ id: 'section-0-1', value: 1 });
  });

  it('should keep a section visible that was already stored as visible', () => {
    stateVariableStateService.getElementCodeById
      .mockImplementation((id: string) => (id === 'section-0-1' ?
        { id, alias: id, status: 'VALUE_CHANGED', value: 1 } :
        undefined));

    initDirective(createSection([{ id: 'text-field_1', operator: '=', value: 'yes' }]));

    expect(emittedVisibilities).toEqual([{ index: 1, isVisible: true }]);
  });
});
