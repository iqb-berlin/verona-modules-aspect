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

  visible!: boolean;
  private ngUnsubscribe = new Subject<void>();
  private activeAfterIDSiblings!: Section[];

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.visible = !this.section.activeAfterID;
    this.activeAfterIDSiblings = this.visible ?
      [] :
      this.pageSections.filter(section => section.activeAfterID === this.section.activeAfterID);
    if (this.mediaStatusChanged) {
      this.mediaStatusChanged
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((id: string): void => this.setActiveAfterID(id));
    }
  }

  private setActiveAfterID(id: string): void {
    if (!this.visible) {
      this.visible = id === this.section.activeAfterID;
      if (this.activeAfterIDSiblings.findIndex(section => section === this.section) === 0) {
        this.elementRef.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
