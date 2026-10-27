import {
  Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild
} from '@angular/core';
import { TextElement } from 'common/models/elements/text';
import { BehaviorSubject, Subject } from 'rxjs';
import { MarkingRange, MarkingData } from 'common/models/marking-data';
import { ValueChangeElement } from 'common/models/input-element-interfaces';
import { takeUntil } from 'rxjs/operators';
import { ElementComponent } from 'common/directives/element-component.directive';
import { RichTextStart } from 'common/utils/rich-text-start';

@Component({
  selector: 'aspect-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss'],
  standalone: false
})
export class TextComponent extends ElementComponent implements OnInit, OnDestroy {
  @Input() elementModel!: TextElement;
  @Input() savedText!: string;
  @Output() selectedColorChanged = new EventEmitter<string | undefined>();
  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();
  @Output() textSelectionStart = new EventEmitter<PointerEvent>();
  @Output() markingDataChanged = new EventEmitter<MarkingData>();

  markingRange!: BehaviorSubject<MarkingRange | null> | null;
  selectedColor: BehaviorSubject<string | undefined> = new BehaviorSubject<string | undefined>(undefined);
  showHint = false;

  private ngUnsubscribe: Subject<void> = new Subject();

  @ViewChild('textContainerRef') textContainerRef!: ElementRef;

  /** No while the marking bar stands above the text: it holds only pictures. */
  static override startsWithText(element: TextElement): boolean {
    if (element.highlightableYellow || element.highlightableTurquoise || element.highlightableOrange) return false;
    return RichTextStart.isText(element.text);
  }

  ngOnInit(): void {
    this.selectedColor
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(color => this.selectedColorChanged.emit(color));
    if (this.elementModel.markingMode === 'range') {
      this.markingRange = new BehaviorSubject<MarkingRange | null>(null);
      this.markingRange
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(range => {
          this.showHint = range !== null && range.second === null;
        });
    }
  }

  startTextSelection(event: PointerEvent): void {
    if (this.elementModel.markingMode === 'selection' &&
      (this.elementModel.markingPanels.length ||
      (this.elementModel.highlightableYellow ||
      this.elementModel.highlightableTurquoise ||
      this.elementModel.highlightableOrange))) {
      this.textSelectionStart.emit(event);
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
