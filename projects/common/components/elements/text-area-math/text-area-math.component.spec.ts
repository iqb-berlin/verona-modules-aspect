// eslint-disable-next-line max-classes-per-file
import {
  ComponentFixture, TestBed, fakeAsync, tick
} from '@angular/core/testing';
import { TextAreaMathElement } from 'common/models/elements/text-area-math';
import { UntypedFormControl, UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { OverlayModule } from '@angular/cdk/overlay';
import {
  Component, Input, Output, EventEmitter, forwardRef,
  Pipe, PipeTransform
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RangeSelectionService } from 'common/services/range-selection.service';
import { PropertyGroupGenerators } from 'common/models/elements/property-group-interfaces';
import { AreaSegmentComponent } from 'common/components/area-segment/area-segment.component';
import { TextAreaMathComponent } from './text-area-math.component';

@Component({
  selector: 'aspect-text-area-math-segment',
  template: '',
  standalone: false,
  providers: [{ provide: AreaSegmentComponent, useExisting: forwardRef(() => MockAreaSegmentComponent) }]
})
class MockAreaSegmentComponent {
  @Input() index!: number;
  @Input() type!: 'text' | 'math';
  @Input() value!: string;
  @Input() selectedFocus!: BehaviorSubject<number>;
  @Input() mathKeyboardPresets!: string[];
  @Input() showSoftwareKeyboard!: boolean;
  @Input() hideNativeKeyboard!: boolean;
  @Input() readonly!: boolean;
  @Output() valueChanged = new EventEmitter<{ index: number; value: string }>();
  @Output() onKeyDown = new EventEmitter<{ keyboardEvent: KeyboardEvent; inputElement: HTMLElement }>();
  @Output() focusIn = new EventEmitter<HTMLElement>();
  @Output() focusOut = new EventEmitter<HTMLElement>();
  @Output() remove = new EventEmitter<number>();

  inputComponent = {
    inputRef: {
      nativeElement: document.createElement('div')
    }
  };

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  setFocus(_offset?: number): void { }
}

@Pipe({ name: 'areaRowHeight', standalone: false })
class MockAreaRowHeightPipe implements PipeTransform {
  transform(value: number): number { return value * 20; }
}

@Pipe({ name: 'errorTransform', standalone: false })
class MockErrorTransformPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(_value: unknown): string { return 'Error'; }
}

describe('TextAreaMathComponent', () => {
  let component: TextAreaMathComponent;
  let fixture: ComponentFixture<TextAreaMathComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TextAreaMathComponent,
        MockAreaSegmentComponent,
        MockAreaRowHeightPipe,
        MockErrorTransformPipe
      ],
      imports: [
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        MatButtonModule,
        MatIconModule,
        OverlayModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TextAreaMathComponent);
    component = fixture.componentInstance;

    const elementProperties = {
      id: 'test',
      type: 'text-area-math',
      rowCount: 2,
      hasAutoHeight: false,
      mathKeyboardPresets: ['math'],
      value: [],
      required: false,
      requiredWarnMessage: 'Error',
      readOnly: false,
      ...PropertyGroupGenerators.generateTextInputProps(),
      dimensions: PropertyGroupGenerators.generateDimensionProps({ width: 100, height: 100 }),
      position: PropertyGroupGenerators.generatePositionProps(),
      styling: {
        ...PropertyGroupGenerators.generateFontStylingProps({ fontSize: 12, fontColor: 'black' }),
        backgroundColor: 'white',
        lineHeight: 135
      }
    } as const;
    component.elementModel = new TextAreaMathElement(elementProperties as unknown as TextAreaMathElement);

    component.parentForm = new UntypedFormGroup({
      test: new UntypedFormControl([])
    });

    fixture.detectChanges();
  });

  /* The spies below reach into the static methods of RangeSelectionService, which is module state
     shared with every other spec file in the run. Left standing, they travel: whenever Vitest puts
     range-selection.service.spec.ts into the same worker after this file, six of its tests read this
     file's mocked values ('test' for the range, true for isRangeInside, {4, 4} for the offsets)
     instead of the browser's. It was blamed on a leaked selection before -- it is a leaked spy. */
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add segments when addFormula is called', fakeAsync(() => {
    const dummyRange = document.createRange();
    const div = document.createElement('div');
    div.textContent = 'test';
    dummyRange.selectNodeContents(div);
    vi.spyOn(RangeSelectionService, 'getRange').mockReturnValue(dummyRange);
    vi.spyOn(RangeSelectionService, 'isRangeInside').mockReturnValue(true);
    vi.spyOn(RangeSelectionService, 'getSelectionRange').mockReturnValue({ start: 4, end: 4 });

    component.segments = [];
    component.addFormula();
    tick(); // wait for addStartSegment setTimeout
    fixture.detectChanges(); // render first segment

    tick(250); // wait for addNewSegments setTimeout
    fixture.detectChanges(); // render all segments

    expect(component.segments.length).toBe(3); // text + math + text
  }));

  /* A press is the pair the browser sends for it: the pointerdown, and the compatibility mousedown
     that follows -- for a finger only once it lifts, after the caret has been set. */
  describe('pressing beside the text (#1218)', () => {
    const press = (target: Element, pointerType: string): MouseEvent => {
      target.dispatchEvent(new PointerEvent('pointerdown', { pointerType, bubbles: true, cancelable: true }));
      tick();
      const mousedown = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
      target.dispatchEvent(mousedown);
      return mousedown;
    };
    const textArea = (): HTMLElement => fixture.nativeElement.querySelector('.text-area');

    it('cancels the mousedown after a finger, so it cannot take the focus from the segment', fakeAsync(() => {
      const mousedown = press(textArea(), 'touch');

      expect(mousedown.defaultPrevented).toBe(true);
      expect(component.segments.length).toBe(1);
    }));

    it('cancels the mousedown after a pen as after a finger', fakeAsync(() => {
      const mousedown = press(textArea(), 'pen');

      expect(mousedown.defaultPrevented).toBe(true);
    }));

    it('leaves the mousedown of a mouse alone', fakeAsync(() => {
      const mousedown = press(textArea(), 'mouse');

      expect(mousedown.defaultPrevented).toBe(false);
      expect(component.segments.length).toBe(1);
    }));

    /* iPadOS shows the caret only for a focus set while it handles the touch; one from a timer
       got the IQB keyboard, but no caret */
    it('focuses the segment while a finger is handled, in an empty area and beside text', () => {
      const setFocus = vi.spyOn(MockAreaSegmentComponent.prototype, 'setFocus');
      const touch = () => textArea()
        .dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'touch', bubbles: true }));

      touch();
      expect(setFocus).toHaveBeenCalledTimes(1);

      touch();
      expect(setFocus).toHaveBeenCalledTimes(2);
    });

    /* Called directly rather than dispatched: a timer started by a dispatched event runs on the real
       clock, out of reach of fakeAsync. The finger above covers the binding. */
    it('focuses the segment only after the mousedown of a mouse', fakeAsync(() => {
      const setFocus = vi.spyOn(MockAreaSegmentComponent.prototype, 'setFocus');

      component.selectLastSegment(new PointerEvent('pointerdown', { pointerType: 'mouse' }));

      expect(setFocus).not.toHaveBeenCalled();
      fixture.detectChanges(); // as the zone does after the event
      tick();
      expect(setFocus).toHaveBeenCalledTimes(1);
    }));

    it('leaves a finger on a segment alone, even right after one beside the text', fakeAsync(() => {
      press(textArea(), 'touch');
      fixture.detectChanges();

      const mousedown = press(fixture.nativeElement.querySelector('aspect-text-area-math-segment'), 'touch');

      expect(mousedown.defaultPrevented).toBe(false);
    }));
  });

  /* WebKit draws the text caret as high as what the line holds: an inline-block counts in full, the
     leading of line-height does not (#1218) */
  it('gives the first line its height through line-height, not through a box', () => {
    const area: HTMLElement = fixture.nativeElement.querySelector('.text-area');
    const spacer = getComputedStyle(fixture.nativeElement.querySelector('.alignment-fix'));

    expect(spacer.display).toBe('inline');
    expect(parseFloat(spacer.lineHeight)).toBeCloseTo(parseFloat(getComputedStyle(area).lineHeight) + 28);
  });

  it('should be disabled when readonly', () => {
    component.elementModel.readOnly = true;
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('.insert-formula-button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});
