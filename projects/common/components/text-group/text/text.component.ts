import {
  Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild
} from '@angular/core';
import { TextElement } from 'common/models/elements/text/text';
import { BehaviorSubject, Subject } from 'rxjs';
import { MarkingRange, MarkingData } from 'common/models/marking-data';
import { ValueChangeElement } from 'common/interfaces';
import { takeUntil } from 'rxjs/operators';
import { ElementComponent } from '../../directives/element-component.directive';

@Component({
    selector: 'aspect-text',
    template: `
    <div [style.width.%]="100"
         [style.height.%]="100">
      <aspect-text-marking-bar
        *ngIf="elementModel.highlightableYellow ||
               elementModel.highlightableTurquoise ||
               elementModel.highlightableOrange"
        [sticky]="true"
        [selectedColor]="selectedColor.value || 'none'"
        [markingMode]="elementModel.markingMode"
        [showHint]="showHint"
        [elementModel]="elementModel"
        (markingDataChanged)="selectedColor.next($event.colorName); markingDataChanged.emit($event)">
      </aspect-text-marking-bar>
      <div #textContainerRef class="text-container"
           [class.orange-selection]="selectedColor.value === 'orange'"
           [class.yellow-selection]="selectedColor.value === 'yellow'"
           [class.turquoise-selection]="selectedColor.value === 'turquoise'"
           [class.delete-selection]="selectedColor.value === 'delete'"
           [style.background-color]="elementModel.styling.backgroundColor"
           [style.color]="elementModel.styling.fontColor"
           [style.font-size.px]="elementModel.styling.fontSize"
           [style.line-height.%]="elementModel.styling.lineHeight"
           [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
           [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
           [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
           [style.column-count]="elementModel.columnCount"
           tooltipEventTooltip
           [innerHTML]="savedText || elementModel.text | safeResourceHTML"
           (contextmenu)="$event.preventDefault()"
           (pointerdown)="startTextSelection($event)">
      </div>
    </div>
  `,
    styles: [
        '::ng-deep .yellow-selection ::selection {background-color: #f9f871}',
        '::ng-deep .turquoise-selection ::selection {background-color: #9de8eb}',
        '::ng-deep .orange-selection ::selection {background-color: #ffa06a}',
        '::ng-deep .delete-selection ::selection {background-color: lightgrey}',
        '::ng-deep .text-container p strong {letter-spacing: 0.02em; font-weight: 750;}',
        '::ng-deep .text-container p:empty::after {content: \'\'; display: inline-block;}', // render empty p
        '::ng-deep .text-container h1 {font-weight: bold; font-size: 20px;}',
        '::ng-deep .text-container h2 {font-weight: bold; font-size: 18px;}',
        '::ng-deep .text-container h3 {font-weight: bold; font-size: 16px;}',
        '::ng-deep .text-container h4 {font-weight: normal; font-size: 16px;}',
        ':host ::ng-deep mark {color: inherit}',
        '::ng-deep sup {line-height: 0;}',
        '::ng-deep sub {line-height: 0;}'
    ],
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
