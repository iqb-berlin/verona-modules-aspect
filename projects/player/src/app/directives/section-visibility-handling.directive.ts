import {
  Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output
} from '@angular/core';
import { merge, Subject } from 'rxjs';
import { Section } from 'common/models/section';
import { takeUntil } from 'rxjs/operators';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import { StorableTimer } from 'player/src/app/classes/storable-timer';
import { Storable } from 'player/src/app/classes/storable';
import { StateVariableStateService } from 'player/src/app/services/state-variable-state.service';
import { VisibilityRule } from 'common/models/visibility-rule';
import { Response } from '@iqb/responses';
import { IsVisibleIndex } from 'player/src/app/models/is-visible-index.interface';
import { ValueChangeElement } from 'common/interfaces';

@Directive({
    selector: '[aspectSectionVisibilityHandling]',
    standalone: false
})
export class SectionVisibilityHandlingDirective implements OnInit, OnDestroy {
  @Input() section!: Section;
  @Input() pageSections!: Section[];
  @Input() pageIndex!: number;
  @Input() sectionIndex!: number;

  @Output() isVisibleIndexChange = new EventEmitter<IsVisibleIndex>();

  private ngUnsubscribe = new Subject<void>();
  private timerStateVariable: StorableTimer | null = null;
  private visibilityVariable: Storable | null = null;
  private isVisible: boolean = false;

  constructor(
    private elementRef: ElementRef,
    private unitStateService: UnitStateService,
    private stateVariableStateService: StateVariableStateService
  ) {}

  ngOnInit(): void {
    if (this.section.visibilityRules.length) {
      this.initVisibilityRulesSection();
    } else {
      this.isVisible = true; // no visibility rules
      // prevent ExpressionChangedAfterItHasBeenCheckedError in snap and scroll mode
      setTimeout(() => this.emitIsVisibleIndexChange(this.isVisible));
    }
  }

  private initVisibilityRulesSection(): void {
    if (!this.section.enableReHide) {
      this.initStorableSection();
    }
    const condition = this.areVisibilityRulesFulfilled() || this.stateVariableStateService
      .getElementCodeById(this.visibilityVariableID)?.value as boolean || false;
    this.isVisible = this.checkVisibility(condition);
    this.handleVisibility();
    if (this.section.enableReHide || !this.isVisible) {
      this.addVisibilitySubscription();
    }
  }

  private initStorableSection(): void {
    const isVisible = this.stateVariableStateService
      .getElementCodeById(this.visibilityVariableID)?.value as number || 0;

    this.visibilityVariable = new Storable(this.visibilityVariableID, isVisible);
    this.stateVariableStateService.registerElementCode(this.visibilityVariableID, this.visibilityVariableID, isVisible);

    this.visibilityVariable.valueChanged
      .subscribe(value => this.stateVariableStateService.changeElementCodeValue({
        id: value.id,
        value: value.value as number
      }));
  }

  private emitIsVisibleIndexChange(isVisible: boolean): void {
    if (this.sectionIndex !== undefined) {
      this.isVisibleIndexChange.emit({ index: this.sectionIndex, isVisible });
    }
  }

  private addVisibilitySubscription(): void {
    merge(
      this.unitStateService.elementCodeChanged,
      this.stateVariableStateService.elementCodeChanged
    )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(code => {
        if (this.isRuleCode(code)) {
          this.isVisible = this.checkVisibility(this.areVisibilityRulesFulfilled());
          this.handleVisibility();
          if (this.isVisible && !this.section.enableReHide) {
            this.removeVisibilitySubscription();
          }
        }
      });
  }

  private removeVisibilitySubscription(): void {
    this.destroyTimerStateVariable();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private get isTimerStateFullFilled(): boolean {
    return this.stateVariableStateService
      .getElementCodeById(this.timerStateVariableId)?.value as number >= this.section.visibilityDelay;
  }

  private isRuleCode(code: Response): boolean {
    return this.section.visibilityRules
      .map(rule => rule.id)
      .some(id => id === code.id) ||
      (!!this.section.visibilityDelay && code.id === this.timerStateVariableId);
  }

  private get timerStateVariableId(): string {
    const firstRule = this.section.visibilityRules[0];
    return `${firstRule.id}-${firstRule.value}-${this.pageIndex}-${this.sectionIndex}-${this.section.visibilityDelay}`;
  }

  private get visibilityVariableID(): string {
    return `section-${this.pageIndex}-${this.sectionIndex}`;
  }

  private initTimerStateVariable(initialValue: number): void {
    this.timerStateVariable = new StorableTimer(
      this.timerStateVariableId, initialValue, this.section.visibilityDelay
    );
    this.timerStateVariable.timerStateValueChanged
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((value: ValueChangeElement) => {
        this.stateVariableStateService.changeElementCodeValue({
          id: value.id,
          value: value.value as number
        });
      });
    this.timerStateVariable.timerStateEnded
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.destroyTimerStateVariable();
      });
    this.stateVariableStateService.registerElementCode(
      this.timerStateVariable.id,
      this.timerStateVariable.id,
      this.timerStateVariable.value);
    this.timerStateVariable.run();
  }

  private destroyTimerStateVariable(): void {
    this.timerStateVariable?.stop();
    this.timerStateVariable = null;
  }

  private checkVisibility(condition: boolean): boolean {
    if (condition) {
      if (this.section.visibilityDelay && !this.section.enableReHide) {
        if (!this.timerStateVariable) {
          this.initTimerStateVariable(this.stateVariableStateService
            .getElementCodeById(this.timerStateVariableId)?.value as number || 0);
        }
        return this.isTimerStateFullFilled;
      }
      return true;
    }
    return false;
  }

  private handleVisibility(): void {
    this.elementRef.nativeElement.style.display = this.isVisible ? 'unset' : 'none';
    if (this.isVisible) {
      if (this.section.animatedVisibility) {
        this.scrollIntoView();
      }
    }
    if (this.visibilityVariable) this.visibilityVariable.value = this.isVisible ? 1 : 0;
    this.emitIsVisibleIndexChange(this.isVisible);
  }

  private getAnyElementCodeById(id: string): Response | undefined {
    return this.unitStateService.getElementCodeById(id) ||
      this.stateVariableStateService.getElementCodeById(id);
  }

  private scrollIntoView(): void {
    this.elementRef.nativeElement.style.scrollMarginTop = 100;
    setTimeout(() => {
      this.elementRef.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  private areVisibilityRulesFulfilled(): boolean {
    const methodName = this.section.logicalConnectiveOfRules === 'disjunction' ? 'some' : 'every';
    return this.section.visibilityRules[methodName](rule => {
      if (this.getAnyElementCodeById(rule.id)) {
        return this.isRuleFullFilled(rule);
      }
      return false;
    });
  }

  private isRuleFullFilled(rule: VisibilityRule): boolean {
    let isFullFilled;
    const codeValue = this.getAnyElementCodeById(rule.id)?.value;
    const value = codeValue || codeValue === 0 ? codeValue : '';
    switch (rule.operator) {
      case '=':
        isFullFilled = value.toString() === rule.value;
        break;
      case '≠':
        isFullFilled = value.toString() !== rule.value;
        break;
      case '>':
        isFullFilled = Number(value) > Number(rule.value);
        break;
      case '<':
        isFullFilled = Number(value) < Number(rule.value);
        break;
      case '≥':
        isFullFilled = Number(value) >= Number(rule.value);
        break;
      case '≤':
        isFullFilled = Number(value) <= Number(rule.value);
        break;
      case 'contains':
        isFullFilled = value.toString().includes(rule.value);
        break;
      case 'pattern':
        isFullFilled = SectionVisibilityHandlingDirective.isPatternMatching(value.toString(), rule.value);
        break;
      case 'minLength':
        isFullFilled = value.toString().length >= Number(rule.value);
        break;
      case 'maxLength':
        isFullFilled = value.toString().length <= Number(rule.value);
        break;
      default:
        isFullFilled = false;
    }
    return isFullFilled;
  }

  private static isPatternMatching(value: string, ruleValue: string): boolean {
    // We use a similar implementation to Angular's PatternValidator
    let regexStr = (ruleValue.charAt(0) !== '^') ? `^${ruleValue}` : ruleValue;
    if (ruleValue.charAt(ruleValue.length - 1) !== '$') regexStr += '$';
    const regex = new RegExp(regexStr);
    return regex.test(value.toString());
  }

  ngOnDestroy(): void {
    this.removeVisibilitySubscription();
  }
}
