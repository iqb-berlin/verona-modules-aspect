import {
  Directive, ElementRef, Input, OnDestroy, OnInit
} from '@angular/core';
import { merge, Subject } from 'rxjs';
import { Section } from 'common/models/section';
import { takeUntil } from 'rxjs/operators';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import { StorableTimer } from 'player/src/app/classes/storable-timer';
import { ValueChangeElement } from 'common/models/elements/element';
import { Response } from 'player/modules/verona/models/verona';
import { Storable } from 'player/src/app/classes/storable';
import { StateVariableStateService } from 'player/src/app/services/state-variable-state.service';
import { VisibilityRule } from 'common/models/visibility-rule';

@Directive({
  selector: '[aspectSectionVisibilityHandling]'
})
export class SectionVisibilityHandlingDirective implements OnInit, OnDestroy {
  @Input() section!: Section;
  @Input() pageSections!: Section[];
  @Input() pageIndex!: number;
  @Input() sectionIndex!: number;

  private ngUnsubscribe = new Subject<void>();
  private rulesAreFulfilled: boolean = false;

  constructor(
    private elementRef: ElementRef,
    private unitStateService: UnitStateService,
    private stateVariableStateService: StateVariableStateService
  ) {}

  ngOnInit(): void {
    if (this.section.visibilityRules.length) {
      this.addSubscription();
    }
  }

  private addSubscription(): void {
    if (this.section.enableReHide ||
      !this.areVisibilityRulesFulfilled() ||
      (this.section.visibilityDelay && !this.isTimerStateFullFilled) ||
      (this.section.animatedVisibility && !this.isAnimatedVisibilityFullFilled)
    ) {
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
  }

  private get isTimerStateFullFilled(): boolean {
    return this.stateVariableStateService
      .getElementCodeById(this.timerStateVariableId)?.value as number >= this.section.visibilityDelay;
  }

  private get isAnimatedVisibilityFullFilled(): boolean {
    return this.stateVariableStateService
      .getElementCodeById(this.animationVariableId)?.value === 1;
  }

  private isRuleCode(code: Response): boolean {
    return this.section.visibilityRules
      .map(rule => rule.id)
      .some(id => id === code.id) ||
      (!!this.section.visibilityDelay && code.id === this.timerStateVariableId) ||
      (this.section.animatedVisibility && code.id === this.animationVariableId);
  }

  private get timerStateVariableId(): string {
    const firstRule = this.section.visibilityRules[0];
    return `${firstRule.id}-${firstRule.value}-${this.pageIndex}-${this.sectionIndex}-${this.section.visibilityDelay}`;
  }

  private get animationVariableId(): string {
    const firstRule = this.section.visibilityRules[0];
    return `${firstRule.id}-${firstRule.value}-${this.pageIndex}-${this.sectionIndex}-scroll-animation`;
  }

  private initTimerStateVariable(): void {
    const timerStateVariable = new StorableTimer(
      this.timerStateVariableId, this.section.visibilityDelay
    );
    this.stateVariableStateService.registerElementCode(timerStateVariable.id, timerStateVariable.value);
    timerStateVariable.timerStateValueChanged
      .subscribe((value: ValueChangeElement) => {
        this.stateVariableStateService.changeElementCodeValue({
          id: value.id,
          value: value.value as number
        });
      });
    timerStateVariable.run();
  }

  private displayHiddenSection(): void {
    if (this.areVisibilityRulesFulfilled() || this.rulesAreFulfilled) {
      if (this.section.visibilityDelay) {
        if (!this.stateVariableStateService.getElementCodeById(this.timerStateVariableId)) {
          this.rulesAreFulfilled = true;
          this.initTimerStateVariable();
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
    this.elementRef.nativeElement.style.display = visible ? null : 'none';
    if (visible) {
      if (this.section.animatedVisibility && !this.isAnimatedVisibilityFullFilled) {
        const animationVariable = new Storable(this.animationVariableId, 1);
        this.stateVariableStateService.registerElementCode(animationVariable.id, 0);
        this.stateVariableStateService.changeElementCodeValue({ id: animationVariable.id, value: 1 });
        this.scrollIntoView();
      }
      if (!this.section.enableReHide) {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
      }
    }
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
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
