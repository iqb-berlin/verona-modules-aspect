import {
  Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChild, ViewChildren
} from '@angular/core';
import { TextAreaMathElement, TextAreaMath } from 'common/models/elements/input-elements/text-area-math';
import {
  AreaSegmentComponent
} from 'common/components/input-elements/text-area-math/area-segment.component';
import { BehaviorSubject } from 'rxjs';
import { RangeSelectionService } from 'common/services/range-selection-service';
import { TextInputComponent } from 'common/directives/text-input-component.directive';

@Component({
  selector: 'aspect-text-area-math',
  template: `
    @if (elementModel.label) {
      <label class="label">{{elementModel.label}}</label>
    }
    <button class="insert-formula-button"
            mat-button
            cdkOverlayOrigin #trigger="cdkOverlayOrigin"
            (click)="addFormula()">
      Formel einfügen
    </button>
    <div #textArea class="text-area"
         [style.min-height.px]="elementModel.rowCount | areaRowHeight :
                                elementModel.styling.fontSize : elementModel.styling.lineHeight"
         [style.height.px]="!elementModel.hasAutoHeight && (elementModel.rowCount | areaRowHeight :
                            elementModel.styling.fontSize : elementModel.styling.lineHeight)"
         [style.overflow-y]="!elementModel.hasAutoHeight && 'auto'"
         [style.background-color]="elementModel.styling.backgroundColor"
         [style.line-height.%]="elementModel.styling.lineHeight"
         [style.color]="elementModel.styling.fontColor"
         [style.font-family]="elementModel.styling.font"
         [style.font-size.px]="elementModel.styling.fontSize"
         [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
         [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
         [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
         (pointerdown)="selectLastSegment()">
      <span class="alignment-fix">&nbsp;</span>
      @for (segment of segments; track segment; let i = $index) {
        <aspect-text-area-math-segment
          [style.display]="'inline'"
          [type]="segment.type"
          [value]="segment.value"
          [selectedFocus]="selectedFocus"
          (valueChanged)="onValueChanged($event)"
          [index]="i"
          (onKeyDown)="onKeyDown.emit($event)"
          (focusIn)="focusChanged.emit({ inputElement: $event, focused: true })"
          (focusOut)="focusChanged.emit({ inputElement: $event, focused: false })"
          (remove)="removeSegment($event)"
          (pointerdown)="$event.stopPropagation();">
        </aspect-text-area-math-segment>
      }
    </div>
    <mat-error *ngIf="elementFormControl.errors && elementFormControl.touched">
      {{ elementFormControl.errors | errorTransform: elementModel }}
    </mat-error>
  `,
  styles: [
    '.label {font-size: 20px; line-height: 135%; display: block; margin-bottom: 15px;}',
    '.alignment-fix {padding: 14px 0; display: inline-block; width: 0;}',
    '.text-area {border: 1px solid black; border-radius: 3px; padding: 10px 5px; }',
    '.insert-formula-button {font-size: large; width: 160px; background-color: #ddd; padding: 15px 10px; height: 55px;}'
  ]
})
export class TextAreaMathComponent extends TextInputComponent implements OnInit {
  @Input() elementModel!: TextAreaMathElement;
  @Output() mathInputFocusIn: EventEmitter<FocusEvent> = new EventEmitter();
  @Output() mathInputFocusOut: EventEmitter<FocusEvent> = new EventEmitter();
  @ViewChildren(AreaSegmentComponent) segmentComponents!: QueryList<AreaSegmentComponent>;
  @ViewChild('textArea') textArea!: ElementRef;

  segments: TextAreaMath[] = [];
  selectedFocus: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  ngOnInit(): void {
    super.ngOnInit();
    if (this.parentForm) this.segments = this.elementFormControl.value;
  }

  private addStartSegment() {
    this.segments.push({
      type: 'text',
      value: ''
    });
    super.setElementValue(this.segments);
  }

  addFormula() {
    if (this.segments.length === 0) {
      this.addStartSegment();
      // wait for rendering of segments
      setTimeout(() => this.addNewSegments());
    } else {
      this.addNewSegments();
    }
  }

  private addNewSegments() {
    this.segments = this.elementFormControl.value;
    this.updateFocus(this.selectedFocus.value);
    const range = RangeSelectionService.getRange();
    if (!range) return;

    const segmentIndex = this.selectedFocus.value;
    let newSegmentIndex = segmentIndex + 1;
    const selectedType = this.segments[this.selectedFocus.value].type;
    if (selectedType === 'text') {
      const content = range.endContainer.parentElement?.textContent || '';
      const { start, end } = RangeSelectionService
        .getSelectionRange(range, this.segmentComponents.toArray()[segmentIndex].inputComponent.inputRef.nativeElement);
      if (content.length === start) {
        this.addSegments(false, true, segmentIndex, '', '');
      } else {
        const startContent = content.slice(0, start);
        const endContent = content.slice(end);
        this.segments[segmentIndex].value = startContent;
        this.addSegments(false, true, segmentIndex, '', endContent);
      }
    } else {
      newSegmentIndex += 1;
      this.addSegments(true, false, segmentIndex, '', '');
    }
    super.setElementValue(this.segments);
    // wait for rendering of segments and keyboard animation
    setTimeout(() => this.updateFocus(newSegmentIndex), 250);
  }

  private updateFormControl(value: TextAreaMath[]): void {
    super.setElementValue(value);
  }

  private addSegments(
    addStartContent: boolean,
    addEndContent: boolean,
    segmentIndex: number,
    startContent: string,
    endContent: string) {
    const targetSegmentIndex = addStartContent ? segmentIndex + 2 : segmentIndex + 1;
    if (addStartContent) this.segments.splice(targetSegmentIndex - 1, 0, { type: 'text', value: startContent });
    this.segments.splice(targetSegmentIndex, 0, { type: 'math', value: '' });
    if (addEndContent) this.segments.splice(targetSegmentIndex + 1, 0, { type: 'text', value: endContent });
  }

  removeSegment(index: number) {
    const segments: TextAreaMath[] = [...this.elementFormControl.value];
    if (segments[index] && segments[index].type === 'math') {
      segments.splice(index, 1);
      // combine text segments
      segments[index - 1].value += segments[index].value;
      const offset = segments[index - 1].value.length;
      segments.splice(index, 1);
      this.segments = segments;
      super.setElementValue(this.segments);
      // wait for rendering of segments
      setTimeout(() => this.updateFocus(index - 1, offset));
    }
  }

  onValueChanged(value: { index: number; value: string }): void {
    const segments = [...this.elementFormControl.value];
    super.setElementValue(
      segments
        .map((segment, index) => ({
          ...value.index === index ? { type: segment.type, value: value.value } : segment
        })));
  }

  private setSegmentValue(value: { index: number; value: string }) {
    this.segments[value.index].value = value.value;
    this.updateFormControl(this.segments);
  }

  setElementValue(value: string, remove?: boolean): void {
    if (remove) {
      this.removeSegment(this.selectedFocus.value - 1);
    } else {
      this.setSegmentValue({ index: this.selectedFocus.value, value: value });
    }
  }

  private updateFocus(index: number, offset?: number): void {
    this.segmentComponents.toArray()[index].setFocus(offset);
  }

  selectLastSegment() {
    if (this.segments.length === 0) {
      this.addStartSegment();
    }
    // wait for rendering of segments
    setTimeout(() => this.updateFocus(this.segments.length - 1));
  }
}
