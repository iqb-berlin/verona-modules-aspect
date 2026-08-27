import {
  AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2, ViewChild
} from '@angular/core';
import { TextElement } from 'common/models/elements/text';
import { BehaviorSubject, Subject } from 'rxjs';
import { MarkingRange } from 'common/models/marking-data';
import { NativeEventService } from 'player/src/app/services/native-event.service';
import { take, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'aspect-markable-word',
  standalone: false,
  templateUrl: './markable-word.component.html',
  styleUrl: './markable-word.component.scss'
})
export class MarkableWordComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() id!: number;
  @Input() text!: string;
  @Input() contentNode: Node | null = null;
  @Input() markingRange!: BehaviorSubject<MarkingRange | null> | null;
  @Input() color!: string | null;
  @Input() markColor!: string | undefined;
  @Output() colorChange = new EventEmitter<string | null>();

  @ViewChild('wordRef') wordRef!: ElementRef<HTMLSpanElement>;

  private ngUnsubscribe = new Subject<void>();
  private cleanMarkingTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(private nativeEventService: NativeEventService, private renderer: Renderer2) {}

  ngOnInit(): void {
    if (this.markingRange) {
      this.markingRange
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => this.applyRangeColor());
    }
  }

  /** A markable that stands for existing markup -- a formula -- is handed the node itself instead of
   * text: it is moved into this span, so it keeps its own markup and gets the marking colour, the
   * click target and the range behaviour of a word around it. */
  ngAfterViewInit(): void {
    if (this.contentNode) {
      this.renderer.appendChild(this.wordRef.nativeElement, this.contentNode);
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
      .pipe(takeUntil(this.ngUnsubscribe), take(1))
      .subscribe(() => this.cleanMarking());
  }

  private cleanMarking(): void {
    this.cleanMarkingTimeout = setTimeout(() => {
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

  /** The deferred end of a range selection has to be cancelled explicitly, otherwise it writes
   * into the marking range of a text this component no longer belongs to. */
  ngOnDestroy(): void {
    if (this.cleanMarkingTimeout !== null) {
      clearTimeout(this.cleanMarkingTimeout);
      this.cleanMarkingTimeout = null;
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
