import {
  Component, ElementRef, Input, OnDestroy, OnInit
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Section } from 'common/interfaces/unit';

@Component({
  selector: 'aspect-section-container',
  templateUrl: './section-container.component.html',
  styleUrls: ['./section-container.component.scss']
})
export class SectionContainerComponent implements OnInit, OnDestroy {
  @Input() mediaStatusChanged!: Subject<string>;
  @Input() section!: Section;
  @Input() pageIndex!: number;
  @Input() pageSections!: Section[];

  isVisible: boolean = true;
  private isScrollSection: boolean = false;
  private ngUnsubscribe = new Subject<void>();

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.isVisible = !this.section.activeAfterID;
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
      this.isVisible = id === this.section.activeAfterID;
      if (this.isScrollSection) {
        this.elementRef.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
