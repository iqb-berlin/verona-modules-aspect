import {
  Directive, ElementRef, Input, OnDestroy, OnInit
} from '@angular/core';
import { Subject } from 'rxjs';
import { Section } from 'common/models/section';
import { takeUntil } from 'rxjs/operators';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import { TimerStateVariable } from 'player/src/app/classes/timer-state-variable';
import { ValueChangeElement } from 'common/models/elements/element';
import { ElementCode, ElementCodeStatusValue } from 'player/modules/verona/models/verona';

@Directive({
  selector: '[aspectSectionVisibilityHandling]'
})
export class SectionVisibilityHandlingDirective implements OnInit, OnDestroy {
  @Input() section!: Section;
  @Input() pageSections!: Section[];

  private isSectionSeen: boolean = false;
  private ngUnsubscribe = new Subject<void>();

  constructor(
    private elementRef: ElementRef,
    private unitStateService: UnitStateService
  ) {}

  ngOnInit(): void {
    if (this.section.visibilityRules.length) {
      this.unitStateService.elementCodeChanged
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(code => {
          if (this.isRuleCode(code)) {
            this.displayHiddenSection();
          }
        });
      this.isSectionSeen = this.hasSeenElements();
    } else {
      this.isSectionSeen = true;
    }
  }

  private isRuleCode(code: ElementCode): boolean {
    return this.section.visibilityRules
      .map(rule => rule.id)
      .some(id => id === code.id) ||
      (!!this.section.visibilityDelay && code.id === this.timerStateVariableId);
  }

  private get timerStateVariableId(): string {
    return `${this.section.visibilityRules[0].id}-
    ${this.section.visibilityRules[0].value}-
    ${this.section.visibilityDelay}`;
  }

  private initTimerStateVariable(): void {
    const timerStateVariable = new TimerStateVariable(
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
    if (this.areVisibilityRulesFulfilled()) {
      if (this.section.visibilityDelay) {
        if (!this.unitStateService.getElementCodeById(this.timerStateVariableId)) {
          this.initTimerStateVariable();
        }
        this.setVisibility(
          (this.unitStateService
            .getElementCodeById(this.timerStateVariableId)?.value as number) >= this.section.visibilityDelay);
      } else {
        this.setVisibility(true);
      }
    } else {
      this.setVisibility(false);
    }
  }

  private setVisibility(visible: boolean): void {
    this.elementRef.nativeElement.style.display = visible ? null : 'none';
    if (visible && this.section.animatedVisibility && !this.isSectionSeen) {
      this.isSectionSeen = true;
      this.elementRef.nativeElement.style.scrollMarginTop = 100;
      setTimeout(() => {
        this.elementRef.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  private areVisibilityRulesFulfilled(): boolean {
    return this.section.visibilityRules.some(rule => {
      if (this.unitStateService.getElementCodeById(rule.id)) {
        switch (rule.operator) {
          case '=':
            return this.unitStateService.getElementCodeById(rule.id)?.value === rule.value;
          case '!=':
            return this.unitStateService.getElementCodeById(rule.id)?.value !== rule.value;
          case '>':
            return Number(this.unitStateService.getElementCodeById(rule.id)?.value) > Number(rule.value);
          case '<':
            return Number(this.unitStateService.getElementCodeById(rule.id)?.value) < Number(rule.value);
          case '>=':
            return Number(this.unitStateService.getElementCodeById(rule.id)?.value) >= Number(rule.value);
          case '<=':
            return Number(this.unitStateService.getElementCodeById(rule.id)?.value) <= Number(rule.value);
          default:
            return false;
        }
      }
      return false;
    });
  }

  private hasSeenElements(): boolean {
    return this.section.getAllElements()
      .map(element => this.unitStateService.getElementCodeById(element.id))
      .some(code => (code ? ElementCodeStatusValue[code.status] > ElementCodeStatusValue.NOT_REACHED : false));
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
