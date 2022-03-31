import {
  Component, Inject, Input, OnDestroy, OnInit
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Section } from '../../../../../common/interfaces/unit';

@Component({
  selector: 'aspect-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.css']
})
export class SectionComponent implements OnInit, OnDestroy{
  @Input() section!: Section;
  @Input() pageIndex!: number;
  @Input() mediaStatusChanged!: Subject<string>;

  visible!: boolean;
  ngUnsubscribe = new Subject<void>();

  constructor(@Inject(DOCUMENT) public document: Document) {}

  ngOnInit(): void {
    this.visible = !this.section.activeAfterID;
    if (this.mediaStatusChanged) {
      this.mediaStatusChanged
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((id: string): void => this.setActivatedAfterID(id));
    }
  }

  private setActivatedAfterID(id: string): void {
    if (!this.visible) {
      this.visible = id === this.section.activeAfterID;
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
