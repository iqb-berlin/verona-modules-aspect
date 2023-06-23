import {
  Directive, ElementRef, Input, OnInit
} from '@angular/core';
import { Subject } from 'rxjs';
import { Section } from 'common/models/section';
import { takeUntil } from 'rxjs/operators';
import { ElementCodeStatusValue } from 'player/modules/verona/models/verona';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import { TimerStateVariable } from 'player/src/app/classes/timer-state-variable';
import { ValueChangeElement } from 'common/models/elements/element';

@Directive({
  selector: '[aspectSectionVisibilityHandling]'
})
export class SectionVisibilityHandlingDirective implements OnInit {
  @Input() mediaStatusChanged!: Subject<string>;
  @Input() section!: Section;
  @Input() pageSections!: Section[];

  private isVisible: boolean = true;
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
          this.displaySection();
        });
    }

    // this.setVisibility(!this.section.activeAfterID);
    // if (!this.isVisible) {
    //   this.mediaStatusChanged
    //     .pipe(
    //       takeUntil(this.ngUnsubscribe),
    //       delay(this.section.activeAfterIdDelay))
    //     .subscribe((id: string): void => {
    //       this.ngUnsubscribe.next();
    //       this.ngUnsubscribe.complete();
    //       this.setActiveAfterID(id);
    //     });
    // }
  }

  displaySection(): void {
    if (this.isSectionVisible()) {
      if (this.section.visibilityDelay) {
        // sollte die gleiche id wie die dazugehörige Rule benutzen
        if (!this.unitStateService.getElementCodeById('test-3000')) {
          const st = new TimerStateVariable('test-3000', 0, this.section.visibilityDelay);
          this.unitStateService.registerElement(st.id, st.value, null, null);
          st.run();
          st.elementValueChanged.subscribe((value: ValueChangeElement) => {
            this.unitStateService.changeElementCodeValue(value);
          });
        }
        if ((this.unitStateService.getElementCodeById('test-3000')?.value as number) >= this.section.visibilityDelay) {
          this.elementRef.nativeElement.style.display = 'block';
        } else {
          this.elementRef.nativeElement.style.display = 'none';
        }
      }
    } else {
      this.elementRef.nativeElement.style.display = 'none';
    }
  }

  isSectionVisible(): boolean {
    return this.section.visibilityRules.some(rule => {
      console.log(this.section.visibilityRules, rule.id, this.unitStateService.getElementCodeById(rule.id));
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
          default:
            return false;
        }
      }
      return false;
    });
  }

  private setVisibility(isVisible: boolean): void {
    this.isVisible = isVisible || this.hasSeenElements;
    this.elementRef.nativeElement.style.display = this.isVisible ? null : 'none';
  }

  private setActiveAfterID(id: string): void {
    this.setVisibility(id === this.section.activeAfterID);
    if (this.isScrollSection) {
      this.elementRef.nativeElement.style.scrollMarginTop = 100;
      setTimeout(() => {
        this.elementRef.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  private get isScrollSection(): boolean {
    return this.pageSections
      .filter(pageSection => pageSection.activeAfterID === this.section.activeAfterID &&
        pageSection.visibilityDelay === this.section.visibilityDelay &&
        pageSection.getAllElements().length)
      .findIndex(section => section === this.section) === 0;
  }

  private get hasSeenElements(): boolean {
    return this.section.getAllElements()
      .map(element => this.unitStateService.getElementCodeById(element.id))
      .some(code => (code ? ElementCodeStatusValue[code.status] > ElementCodeStatusValue.NOT_REACHED : false));
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
