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
  templateUrl: './text-area-math.component.html',
  styleUrls: ['./text-area-math.component.scss'],
  standalone: false
})
export class TextAreaMathComponent extends TextInputComponent implements OnInit {
  @Input() elementModel!: TextAreaMathElement;
  @Input() mathInputFocusIn: EventEmitter<FocusEvent> = new EventEmitter();
  @Output() mathInputFocusOut: EventEmitter<FocusEvent> = new EventEmitter();
  @ViewChildren('segment') segmentComponents!: QueryList<AreaSegmentComponent>;
  @ViewChild('textArea') textArea!: ElementRef;

  segments: TextAreaMath[] = [];
  selectedFocus: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  ngOnInit(): void {
    super.ngOnInit();
    if (this.parentForm) this.segments = [...this.elementFormControl.value];
  }

  private addStartSegment() {
    this.segments.push({
      type: 'text',
      value: ''
    });
    super.setElementValue([...this.segments]);
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

  private getSelectedInputRange(): Range {
    const range = RangeSelectionService.getRange();
    if (this.segmentComponents.length > 0 &&
      (!range || !RangeSelectionService.isRangeInside(range, this.textArea.nativeElement))) {
      RangeSelectionService
        .setRange(this.segmentComponents.toArray()[this.selectedFocus.value].inputComponent.inputRef.nativeElement);
    }
    return RangeSelectionService.getRange() as Range;
  }

  private addNewSegments() {
    this.segments = [...this.elementFormControl.value];
    const range = this.getSelectedInputRange();
    const segmentIndex = this.selectedFocus.value;
    let newSegmentIndex = segmentIndex + 1;
    const selectedType = this.segments[this.selectedFocus.value].type;
    const currentSegment = this.segmentComponents.toArray()[segmentIndex];
    if (selectedType === 'text' && currentSegment) {
      const content = range.endContainer.parentElement?.textContent || '';
      const { start, end } = RangeSelectionService
        .getSelectionRange(range, currentSegment.inputComponent.inputRef.nativeElement);
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
    super.setElementValue([...this.segments]);
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
      super.setElementValue([...this.segments]);
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
    const elementFormControlValue = [...this.elementFormControl.value];
    elementFormControlValue[value.index].value = value.value;
    this.updateFormControl([...elementFormControlValue]);
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
