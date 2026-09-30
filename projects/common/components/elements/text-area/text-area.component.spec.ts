// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  Component, Directive, EventEmitter, Input, Output, Pipe, PipeTransform
} from '@angular/core';
import { By } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TextAreaElement, TextAreaProperties } from 'common/models/elements/text-area';
import { InputElement } from 'common/models/elements/element';
import { TextAreaComponent } from './text-area.component';

@Component({
  selector: 'aspect-cloze-child-error-message',
  template: '',
  standalone: false
})
class MockClozeChildErrorMessageComponent {
  @Input() elementModel!: InputElement;
  @Input() elementFormControl!: UntypedFormControl;
}

@Pipe({ name: 'errorTransform', standalone: false })
class MockErrorTransformPipe implements PipeTransform {
  transform(): string { return 'Error'; }
}

@Directive({ selector: '[dynamicRows]', standalone: false })
class MockDynamicRowsDirective {
  @Input() fontSize!: number;
  @Input() expectedCharactersCount!: number;
  @Output() dynamicRowsChange = new EventEmitter<number>();
}

@Directive({ selector: '[autoHeight]', standalone: false })
class MockAutoHeightDirective {
  @Input() autoHeight!: boolean;
}

describe('TextAreaComponent', () => {
  let component: TextAreaComponent;
  let fixture: ComponentFixture<TextAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TextAreaComponent,
        MockClozeChildErrorMessageComponent,
        MockErrorTransformPipe,
        MockDynamicRowsDirective,
        MockAutoHeightDirective
      ],
      imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TextAreaComponent);
    component = fixture.componentInstance;
    component.elementModel = new TextAreaElement({
      type: 'text-area',
      id: 'test-id',
      alias: 'test-alias',
      rowCount: 3
    } as Partial<TextAreaProperties>);
    component.parentForm = new UntypedFormGroup({
      'test-id': new UntypedFormControl('')
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the label', () => {
    component.elementModel.label = 'Test Label';
    fixture.detectChanges();
    const labelElement = fixture.nativeElement.querySelector('mat-label');
    expect(labelElement.textContent).toContain('Test Label');
  });

  it('should size the textarea with rowCount if dynamic row count is disabled', () => {
    component.elementModel.hasDynamicRowCount = false;
    component.elementModel.rowCount = 5;
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector('textarea');
    expect(textarea.rows).toBe(5);
  });

  it('should size the textarea with the calculated dynamic rows', () => {
    component.elementModel.hasDynamicRowCount = true;
    const rowsDirective = fixture.debugElement
      .query(By.directive(MockDynamicRowsDirective)).injector.get(MockDynamicRowsDirective);
    rowsDirective.dynamicRowsChange.emit(7);
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector('textarea');
    expect(component.dynamicRows).toBe(7);
    expect(textarea.rows).toBe(7);
  });

  it('should render a plain textarea without form field in tableMode', () => {
    component.tableMode = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('textarea.table-child')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('mat-form-field')).toBeNull();
  });

  it('should paint the background colour on the textarea in tableMode', () => {
    // In a table cell there is no form field whose wrapper the --backgroundColor variable could
    // reach, so the colour has to sit on the textarea itself (#1361)
    component.tableMode = true;
    component.elementModel.styling.backgroundColor = 'rgb(255, 0, 0)';
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector('textarea.table-child');
    expect(textarea.style.backgroundColor).toBe('rgb(255, 0, 0)');
  });

  it('should hand the background colour to the form field outside tableMode', () => {
    component.elementModel.styling.backgroundColor = 'rgb(0, 255, 0)';
    fixture.detectChanges();
    const formField = fixture.nativeElement.querySelector('mat-form-field');
    expect(formField.style.getPropertyValue('--backgroundColor')).toBe('rgb(0, 255, 0)');
  });

  it('should emit focusChanged on focus and blur', () => {
    vi.spyOn(component.focusChanged, 'emit');
    const textarea = fixture.nativeElement.querySelector('textarea');
    textarea.dispatchEvent(new Event('focus'));
    expect(component.focusChanged.emit).toHaveBeenCalledWith({ inputElement: textarea, focused: true });
    textarea.dispatchEvent(new Event('blur'));
    expect(component.focusChanged.emit).toHaveBeenCalledWith({ inputElement: textarea, focused: false });
  });

  it('should emit onKeyDown on keydown', () => {
    vi.spyOn(component.onKeyDown, 'emit');
    const textarea = fixture.nativeElement.querySelector('textarea');
    const keyboardEvent = new KeyboardEvent('keydown', { key: 'a' });
    textarea.dispatchEvent(keyboardEvent);
    expect(component.onKeyDown.emit).toHaveBeenCalledWith({ keyboardEvent, inputElement: textarea });
  });

  describe('word count strip', () => {
    const findStrip = (): HTMLElement | null => fixture.nativeElement.querySelector('.word-count');
    const strip = (): HTMLElement => {
      const found = findStrip();
      if (!found) throw new Error('expected a word count strip');
      return found;
    };
    const stripText = (): string => (strip().textContent ?? '').trim();
    const isBelow = (upper: HTMLElement, lower: HTMLElement): boolean => lower
      .getBoundingClientRect().top >= upper.getBoundingClientRect().bottom;

    beforeEach(() => {
      const translateService = TestBed.inject(TranslateService);
      translateService.setTranslation('de', { wordCount: '{{count}} Wörter', wordCountOne: '1 Wort' });
      translateService.use('de');
    });

    it('should not be there unless the element asks for it', () => {
      expect(findStrip()).toBeNull();
      component.tableMode = true;
      fixture.detectChanges();
      expect(findStrip()).toBeNull();
    });

    it('should sit inside the form field, below the text', () => {
      component.elementModel.showWordCount = true;
      fixture.detectChanges();

      const textarea: HTMLElement = fixture.nativeElement.querySelector('textarea');
      expect(fixture.nativeElement.querySelector('mat-form-field').contains(strip())).toBe(true);
      expect(isBelow(textarea, strip())).toBe(true);
    });

    // The editor never sets a count, so what it shows is the count the component starts with.
    it('should show no words until a count is set, and then the count', () => {
      component.elementModel.showWordCount = true;
      fixture.detectChanges();
      expect(stripText()).toBe('0 Wörter');

      component.wordCount.set(12);
      fixture.detectChanges();

      expect(stripText()).toBe('12 Wörter');
    });

    it('should share the table cell with the textarea in tableMode', () => {
      component.tableMode = true;
      component.elementModel.showWordCount = true;
      component.wordCount.set(2);
      fixture.detectChanges();

      const textarea: HTMLElement = fixture.nativeElement.querySelector('textarea.table-child');
      expect(fixture.nativeElement.classList).toContain('table-word-count');
      expect(window.getComputedStyle(fixture.nativeElement).display).toBe('flex');
      expect(stripText()).toBe('2 Wörter');
      expect(isBelow(textarea, strip())).toBe(true);
    });

    // The strip takes its share of a cell too small for both; the rows must not pay for it.
    it('should not squeeze the textarea below its rows in a table cell', () => {
      fixture.nativeElement.style.height = '40px';
      component.tableMode = true;
      component.elementModel.hasDynamicRowCount = false;
      component.elementModel.rowCount = 5;
      fixture.detectChanges();
      const textarea: HTMLElement = fixture.nativeElement.querySelector('textarea.table-child');
      const heightWithoutStrip = textarea.getBoundingClientRect().height;

      component.elementModel.showWordCount = true;
      fixture.detectChanges();

      expect(textarea.getBoundingClientRect().height).toBe(heightWithoutStrip);
    });

    it('should keep the count plain when the text is bold and italic', () => {
      component.elementModel.showWordCount = true;
      component.elementModel.styling.bold = true;
      component.elementModel.styling.italic = true;
      fixture.detectChanges();

      const text: HTMLElement = fixture.nativeElement.querySelector('.word-count-text');
      expect(window.getComputedStyle(text).fontWeight).toBe('400');
      expect(window.getComputedStyle(text).fontStyle).toBe('normal');
    });

    it('should set the count smaller and lighter than the text', () => {
      component.elementModel.showWordCount = true;
      component.elementModel.styling.fontSize = 20;
      fixture.detectChanges();

      const text = window.getComputedStyle(fixture.nativeElement.querySelector('.word-count-text'));
      expect(text.fontSize).toBe('15px');
      expect(Number(text.opacity)).toBeLessThan(1);
    });

    it('should name a single word in the singular, and none in the plural', () => {
      component.elementModel.showWordCount = true;
      component.wordCount.set(1);
      fixture.detectChanges();
      expect(stripText()).toBe('1 Wort');

      component.wordCount.set(0);
      fixture.detectChanges();
      expect(stripText()).toBe('0 Wörter');
    });
  });
});
