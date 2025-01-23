import {
  Component, EventEmitter, Input, OnDestroy, OnInit, Output
} from '@angular/core';
import { TextElement } from 'common/models/elements/text/text';
import { BehaviorSubject, Subject } from 'rxjs';
import { MarkingRange } from 'common/models/marking-data';
import { NativeEventService } from 'player/src/app/services/native-event.service';
import { first, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'aspect-markable-word',
  standalone: true,
  imports: [],
  templateUrl: './markable-word.component.html',
  styleUrl: './markable-word.component.scss'
})
export class MarkableWordComponent implements OnInit, OnDestroy {
  @Input() id!: number;
  @Input() text!: string;
  @Input() markingRange!: BehaviorSubject<MarkingRange | null> | null;
  @Input() color!: string | null;
  @Input() markColor!: string | undefined;
  @Output() colorChange = new EventEmitter<string | null>();

  private ngUnsubscribe = new Subject<void>();

  constructor(private nativeEventService: NativeEventService) {}

  ngOnInit(): void {
    if (this.markingRange) {
      this.markingRange
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => this.applyRangeColor());
    }
  }

  onWordClick(): void {
    if (!this.markColor || this.markColor === 'none') {
      return;
    }
    if (!this.markingRange) {
      this.toggleMarked(this.markColor);
    } else {
      this.toggleRange();
    }
  }

  private applyRangeColor(): void {
    if (!this.markColor || this.markColor === 'none') {
      return;
    }
    const range = this.getRange();
    if (range && this.id >= range.start && this.id <= range.end) {
      this.toggleRangedMarked(this.markColor);
    }
  }

  private getRange(): { start: number, end: number } | null {
    if (this.markingRange?.value) {
      const firstWord = this.markingRange.value.first;
      const secondWord = this.markingRange.value.second;
      if (firstWord !== null && secondWord !== null) {
        return {
          start: Math.min(firstWord, secondWord),
          end: Math.max(firstWord, secondWord)
        };
      }
    }
    return null;
  }

  private toggleRange(): void {
    const actualValue = this.markingRange?.value as MarkingRange | null;
    if (actualValue === null) {
      this.subscribeForMouseUp();
      this.markingRange?.next({ first: this.id, second: null });
    } else {
      this.markingRange?.next({ ...actualValue, second: this.id });
    }
  }

  private subscribeForMouseUp(): void {
    this.nativeEventService.mouseUp
      .pipe(takeUntil(this.ngUnsubscribe), first())
      .subscribe(() => this.cleanMarking());
  }

  private cleanMarking(): void {
    setTimeout(() => {
      if (this.markingRange?.value) {
        this.markingRange.next(null);
      }
    });
  }

  private toggleRangedMarked(markColor: string): void {
    if (this.markColor === 'delete') {
      this.unmark();
    } else {
      this.mark(markColor);
    }
  }

  private toggleMarked(markColor: string): void {
    if (this.color && this.color === TextElement.selectionColors[markColor]) {
      this.unmark();
    } else {
      this.mark(markColor);
    }
  }

  private mark(markColor: string): void {
    this.color = TextElement.selectionColors[markColor];
    this.colorChange.emit(this.color);
  }

  private unmark(): void {
    this.color = null;
    this.colorChange.emit(this.color);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
