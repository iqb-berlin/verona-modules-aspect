import { Directive, ElementRef, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { Section } from 'common/models/section';
import { takeUntil } from 'rxjs/operators';

@Directive({
  selector: '[aspectSectionVisibilityHandling]'
})
export class SectionVisibilityHandlingDirective {
  @Input() mediaStatusChanged!: Subject<string>;
  @Input() section!: Section;
  @Input() pageSections!: Section[];

  private isVisible: boolean = true;
  private isScrollSection: boolean = false;
  private ngUnsubscribe = new Subject<void>();

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.setVisibility(!this.section.activeAfterID);
    this.isScrollSection = this.isVisible ?
      false :
      this.pageSections
        .filter(pageSection => pageSection.activeAfterID === this.section.activeAfterID)
        .findIndex(section => section === this.section) === 0;

    if (this.mediaStatusChanged) {
      this.mediaStatusChanged
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((id: string): void => this.setActiveAfterID(id));
    }
  }

  private setActiveAfterID(id: string): void {
    if (!this.isVisible) {
      this.setVisibility(id === this.section.activeAfterID);
      if (this.isScrollSection) {
        this.elementRef.nativeElement.style.scrollMargin = `${window.innerHeight / 3}px`;
        this.elementRef.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  private setVisibility(isVisible: boolean): void {
    this.isVisible = isVisible;
    this.elementRef.nativeElement.style.display = isVisible ? null : 'none';
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
