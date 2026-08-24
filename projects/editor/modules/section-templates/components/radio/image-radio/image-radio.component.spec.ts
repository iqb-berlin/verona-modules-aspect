// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { TextImageLabel } from 'common/models/label-interfaces';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import {
  NumberFieldBadInputDirective
} from 'editor/modules/editor-shared/directives/number-field-bad-input.directive';
import { NumberFieldDirective } from 'editor/modules/editor-shared/directives/number-field.directive';
import { MessageService } from 'editor/src/app/services/message.service';
import {
  ImageRadioComponent
} from 'editor/modules/section-templates/components/radio/image-radio/image-radio.component';

@Component({
  standalone: false,
  selector: 'aspect-rich-text-editor',
  template: ''
})
class MockRichTextEditorComponent {
  @Input() content: string = '';
  @Input() placeholder: string = '';
  @Input() disabled: boolean = false;
  @Output() contentChange = new EventEmitter<string>();
}

@Component({
  standalone: false,
  selector: 'aspect-option-list-panel',
  template: ''
})
class MockOptionListPanelComponent {
  @Input() textFieldLabel: string = '';
  @Input() itemList: TextImageLabel[] = [];
  @Input() showImageButton: boolean = false;
  @Input() localMode: boolean = false;
  @Output() itemListUpdated = new EventEmitter<void>();
}

describe('ImageRadioComponent', () => {
  let component: ImageRadioComponent;
  let fixture: ComponentFixture<ImageRadioComponent>;
  let messageService: SpyObj<MessageService>;

  const createLabel = (text: string): TextImageLabel => ({
    text, imgSrc: null, imgFileName: '', imgPosition: 'above'
  });

  beforeEach(async () => {
    messageService = createSpyObj<MessageService>(['showWarning']);

    await TestBed.configureTestingModule({
      declarations: [
        ImageRadioComponent,
        MockRichTextEditorComponent,
        MockOptionListPanelComponent,
        NumberFieldDirective,
        NumberFieldBadInputDirective
      ],
      imports: [
        FormsModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        TranslateModule.forRoot()
      ],
      providers: [{ provide: MessageService, useValue: messageService }]
    }).compileComponents();

    fixture = TestBed.createComponent(ImageRadioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default options', () => {
    expect(component.options.label1).toBe('');
    expect(component.options.options).toEqual([]);
    expect(component.options.itemsPerRow).toBe(4);
    expect(component.options.addExtraInput).toBe(false);
    expect(component.options.extraInputMathfield).toBe(false);
  });

  it('should emit invalid state with fewer than two options', () => {
    const emitSpy = vi.spyOn(component.validityChange, 'emit');
    component.options.options = [createLabel('a')];

    component.checkValidity();

    expect(emitSpy).toHaveBeenCalledWith(false);
  });

  it('should emit valid state with at least two options', () => {
    const emitSpy = vi.spyOn(component.validityChange, 'emit');
    component.options.options = [createLabel('a'), createLabel('b')];

    component.checkValidity();

    expect(emitSpy).toHaveBeenCalledWith(true);
  });

  it('should check validity when the option list is updated', () => {
    const checkValiditySpy = vi.spyOn(component, 'checkValidity');
    const optionListPanel = fixture.debugElement.query(By.directive(MockOptionListPanelComponent));

    (optionListPanel.componentInstance as MockOptionListPanelComponent).itemListUpdated.emit();

    expect(checkValiditySpy).toHaveBeenCalled();
  });

  /* `min="1" max="9"` sat on the box and nothing enforced them, and the binding was two-way - so an
     emptied box or a 0 went into the generated section, where it becomes the column count of the
     radio group (#1164). */
  describe('the images-per-row box', () => {
    const box = (): HTMLInputElement => fixture.nativeElement
      .querySelector('input[type="number"]') as HTMLInputElement;

    const edit = async (value: string): Promise<void> => {
      box().value = value;
      box().dispatchEvent(new Event('input'));
      fixture.detectChanges();
      box().dispatchEvent(new Event('blur'));
      fixture.detectChanges();
      await fixture.whenStable();
    };

    it('should take an edited count', async () => {
      await edit('2');

      expect(component.options.itemsPerRow).toBe(2);
    });

    it('should refuse a count above the maximum and put the box back', async () => {
      await edit('12');

      expect(component.options.itemsPerRow).toBe(4);
      expect(box().value).toBe('4');
      expect(messageService.showWarning).toHaveBeenCalledTimes(1);
    });

    it('should refuse an emptied count', async () => {
      await edit('');

      expect(component.options.itemsPerRow).toBe(4);
      expect(box().value).toBe('4');
    });
  });
});
