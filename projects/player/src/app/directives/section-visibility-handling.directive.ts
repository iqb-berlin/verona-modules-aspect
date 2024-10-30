import {
  Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output
} from '@angular/core';
import { merge, Subject } from 'rxjs';
import { Section } from 'common/models/section';
import { takeUntil } from 'rxjs/operators';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import { StorableTimer } from 'player/src/app/classes/storable-timer';
import { StateVariableStateService } from 'player/src/app/services/state-variable-state.service';
import { VisibilityRule } from 'common/models/visibility-rule';
import { Response } from '@iqb/responses';
import { IsVisibleIndex } from 'player/src/app/models/is-visible-index.interface';
import { ValueChangeElement } from 'common/interfaces';

@Directive({
  selector: '[aspectSectionVisibilityHandling]'
})
export class SectionVisibilityHandlingDirective implements OnInit, OnDestroy {
  @Input() section!: Section;
  @Input() pageSections!: Section[];
  @Input() pageIndex!: number;
  @Input() sectionIndex!: number;

  @Output() isVisibleIndexChange = new EventEmitter<IsVisibleIndex>();

  private ngUnsubscribe = new Subject<void>();
  private rulesAreFulfilled: boolean = false;
  private timerStateVariable: StorableTimer | null = null;

  constructor(
    private elementRef: ElementRef,
    private unitStateService: UnitStateService,
    private stateVariableStateService: StateVariableStateService
  ) {}

  ngOnInit(): void {
    if (this.section.visibilityRules.length) {
      this.addSubscription();
    } else {
      // prevent ExpressionChangedAfterItHasBeenCheckedError in snap and scroll mode
      setTimeout(() => this.emitIsVisibleIndexChange(true));
    }
  }

  private emitIsVisibleIndexChange(isVisible: boolean): void {
    if (this.sectionIndex !== undefined) {
      this.isVisibleIndexChange.emit({ index: this.sectionIndex, isVisible });
    }
  }

  private addSubscription(): void {
    this.displayHiddenSection();
    merge(
      this.unitStateService.elementCodeChanged,
      this.stateVariableStateService.elementCodeChanged
    )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(code => {
        if (this.isRuleCode(code)) {
          this.displayHiddenSection();
        }
      });
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

  private displayHiddenSection(): void {
    if (this.areVisibilityRulesFulfilled() || this.rulesAreFulfilled) {
      if (this.section.visibilityDelay && !this.section.enableReHide) {
        if (!this.timerStateVariable) {
          this.rulesAreFulfilled = true;
          this.initTimerStateVariable(this.stateVariableStateService
            .getElementCodeById(this.timerStateVariableId)?.value as number || 0);
        }
        this.setVisibility(this.isTimerStateFullFilled);
      } else {
        this.setVisibility(true);
      }
    } else {
      this.setVisibility(false);
    }
  }

  private setVisibility(visible: boolean): void {
    this.elementRef.nativeElement.style.display = visible ? 'unset' : 'none';
    if (visible) {
      if (this.section.animatedVisibility) {
        this.scrollIntoView();
      }
      if (!this.section.enableReHide) {
        this.destroyTimerStateVariable();
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
      }
    }
    this.emitIsVisibleIndexChange(visible);
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

  isRuleFullFilled(rule: VisibilityRule): boolean {
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
    this.destroyTimerStateVariable();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
