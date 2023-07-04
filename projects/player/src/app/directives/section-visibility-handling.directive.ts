import {
  Directive, ElementRef, Input, OnDestroy, OnInit
} from '@angular/core';
import { Subject } from 'rxjs';
import { Section } from 'common/models/section';
import { takeUntil } from 'rxjs/operators';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import { StorableTimer } from 'player/src/app/classes/storable-timer';
import { ValueChangeElement } from 'common/models/elements/element';
import { ElementCode } from 'player/modules/verona/models/verona';
import { Storable } from 'player/src/app/classes/storable';

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
    private unitStateService: UnitStateService
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
      this.unitStateService.elementCodeChanged
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(code => {
          if (this.isRuleCode(code)) {
            this.displayHiddenSection();
          }
        });
    }
  }

  private get isTimerStateFullFilled(): boolean {
    return this.unitStateService
      .getElementCodeById(this.timerStateVariableId)?.value as number >= this.section.visibilityDelay;
  }

  private get isAnimatedVisibilityFullFilled(): boolean {
    return this.unitStateService
      .getElementCodeById(this.animationVariableId)?.value === 1;
  }

  private isRuleCode(code: ElementCode): boolean {
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
    this.unitStateService.registerElement(timerStateVariable.id, timerStateVariable.value);
    timerStateVariable.timerStateValueChanged
      .subscribe((value: ValueChangeElement) => {
        this.unitStateService.changeElementCodeValue(value);
      });
    timerStateVariable.run();
  }

  private displayHiddenSection(): void {
    if (this.areVisibilityRulesFulfilled() || this.rulesAreFulfilled) {
      if (this.section.visibilityDelay) {
        if (!this.unitStateService.getElementCodeById(this.timerStateVariableId)) {
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
        this.unitStateService.registerElement(animationVariable.id, 1);
        this.scrollIntoView();
      }
      if (!this.section.enableReHide) {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
      }
    }
  }

  private scrollIntoView(): void {
    this.elementRef.nativeElement.style.scrollMarginTop = 100;
    setTimeout(() => {
      this.elementRef.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  private areVisibilityRulesFulfilled(): boolean {
    return this.section.visibilityRules.some(rule => {
      if (this.unitStateService.getElementCodeById(rule.id)) {
        switch (rule.operator) {
          case '=':
            return this.unitStateService.getElementCodeById(rule.id)?.value?.toString() === rule.value;
          case '≠':
            return this.unitStateService.getElementCodeById(rule.id)?.value?.toString() !== rule.value;
          case '>':
            return Number(this.unitStateService.getElementCodeById(rule.id)?.value) > Number(rule.value);
          case '<':
            return Number(this.unitStateService.getElementCodeById(rule.id)?.value) < Number(rule.value);
          case '≥':
            return Number(this.unitStateService.getElementCodeById(rule.id)?.value) >= Number(rule.value);
          case '≤':
            return Number(this.unitStateService.getElementCodeById(rule.id)?.value) <= Number(rule.value);
          case 'contains':
            return this.unitStateService.getElementCodeById(rule.id)?.value?.toString().includes(rule.value);
          case 'pattern':
            // We use a similar implementation to Angular's PatternValidator
            if (this.unitStateService.getElementCodeById(rule.id)?.value !== null) {
              let regexStr = (rule.value.charAt(0) !== '^') ? `^${rule.value}` : rule.value;
              if (rule.value.charAt(rule.value.length - 1) !== '$') regexStr += '$';
              const regex = new RegExp(regexStr);
              return regex.test(this.unitStateService.getElementCodeById(rule.id)?.value?.toString() as string);
            }
            return false;
          case 'minLength':
            return (this.unitStateService.getElementCodeById(rule.id)?.value as string)
              .toString()?.length >= Number(rule.value);
          case 'maxLength':
            return (this.unitStateService.getElementCodeById(rule.id)?.value as string)
              .toString()?.length <= Number(rule.value);
          default:
            return false;
        }
      }
      return true;
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
