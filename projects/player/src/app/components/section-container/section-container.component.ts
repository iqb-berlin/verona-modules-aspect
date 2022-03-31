import {
  Component, Input, OnDestroy, OnInit
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Section } from '../../../../../common/interfaces/unit';

@Component({
  selector: 'aspect-section-container',
  templateUrl: './section-container.component.html',
  styleUrls: ['./section-container.component.scss']
})
export class SectionContainerComponent implements OnInit, OnDestroy {
  @Input() mediaStatusChanged!: Subject<string>;
  @Input() section!: Section;
  @Input() pageIndex!: number;

  visible!: boolean;
  private ngUnsubscribe = new Subject<void>();

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
