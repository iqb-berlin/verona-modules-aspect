import { Directive, ElementRef, Input } from '@angular/core';
import { delay, Subject } from 'rxjs';
import { Section } from 'common/models/section';
import { takeUntil } from 'rxjs/operators';
import { ElementCodeStatusValue } from 'player/modules/verona/models/verona';
import { UnitStateService } from 'player/src/app/services/unit-state.service';

@Directive({
  selector: '[aspectSectionVisibilityHandling]'
})
export class SectionVisibilityHandlingDirective {
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
    this.setVisibility(!this.section.activeAfterID);
    if (!this.isVisible) {
      this.mediaStatusChanged
        .pipe(
          takeUntil(this.ngUnsubscribe),
          delay(this.section.activeAfterIdDelay))
        .subscribe((id: string): void => {
          this.ngUnsubscribe.next();
          this.ngUnsubscribe.complete();
          this.setActiveAfterID(id);
        });
    }
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
        pageSection.activeAfterIdDelay === this.section.activeAfterIdDelay &&
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
