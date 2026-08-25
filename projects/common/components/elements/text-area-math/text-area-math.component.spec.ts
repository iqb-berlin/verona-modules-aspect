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

  it('should be disabled when readonly', () => {
    component.elementModel.readOnly = true;
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('.insert-formula-button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});
