import {
  ComponentFixture, TestBed, fakeAsync, flush
} from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { SafeResourceHTMLPipe } from 'common/pipes/safe-resource-html.pipe';
import { FileService } from 'common/services/file.service';
import { SpyObj, createSpyObj } from 'common/utils/vitest-spy-object';
import { DialogService } from 'editor/src/app/services/dialog.service';
import {
  DroplistWizardDialogComponent
} from 'editor/modules/section-templates/components/droplist-dialog/droplist-dialog.component';

@Component({
  standalone: false,
  selector: 'aspect-rich-text-editor',
  template: ''
})
class MockRichTextEditorComponent {
  @Input() content: string = '';
  @Input() placeholder: string = '';
  @Input() showReducedControls: boolean = false;
  @Output() contentChange = new EventEmitter<string>();
}

describe('DroplistWizardDialogComponent', () => {
  let component: DroplistWizardDialogComponent;
  let fixture: ComponentFixture<DroplistWizardDialogComponent>;
  let mockDialogService: SpyObj<DialogService>;

  const mockDialogRef = {
    close: vi.fn()
  };

  beforeEach(async () => {
    mockDialogRef.close.mockClear();
    mockDialogService = createSpyObj<DialogService>(['showImageResizeDialog', 'showLabelEditDialog']);

    await TestBed.configureTestingModule({
      declarations: [
        DroplistWizardDialogComponent,
        MockRichTextEditorComponent,
        SafeResourceHTMLPipe
      ],
      imports: [
        CommonModule,
        FormsModule,
        DragDropModule,
        TextFieldModule,
        MatDialogModule,
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatRadioModule,
        MatSelectModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: DialogService, useValue: mockDialogService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DroplistWizardDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default options and no variant', () => {
    expect(component.templateVariant).toBeUndefined();
    expect(component.options.optionWidth).toBe('short');
    expect(component.options.targetLabelAlignment).toBe('column');
    expect(component.options.options).toEqual([]);
    expect(component.options.targetLabels).toEqual([]);
  });

  it('should show the variant choice buttons until a variant is selected', () => {
    const variantButtons = fixture.nativeElement.querySelectorAll('.variant-choice button');
    expect(variantButtons.length).toBe(3);

    (variantButtons[2] as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(component.templateVariant).toBe('sort');
    expect(fixture.nativeElement.querySelector('.variant-choice')).toBeNull();
  });

  it('should reorder options on drop', () => {
    component.options.options = ['a', 'b', 'c'];
    component.drop({
      previousIndex: 2, currentIndex: 0, container: { data: component.options.options }
    } as CdkDragDrop<string[]>);
    expect(component.options.options).toEqual(['c', 'a', 'b']);
  });

  it('should reorder the target labels, not the options, on a drop in the target list', () => {
    component.options.options = ['a', 'b'];
    component.options.targetLabels = ['x', 'y'];
    component.drop({
      previousIndex: 1, currentIndex: 0, container: { data: component.options.targetLabels }
    } as CdkDragDrop<string[]>);
    expect(component.options.targetLabels).toEqual(['y', 'x']);
    expect(component.options.options).toEqual(['a', 'b']);
  });

  it('should update an option after label editing', () => {
    component.options.options = ['a', 'b'];
    mockDialogService.showLabelEditDialog.mockReturnValue(of({ text: 'edited' }));

    component.editItem(component.options.options, 1);

    expect(mockDialogService.showLabelEditDialog).toHaveBeenCalledWith({ text: 'b' });
    expect(component.options.options).toEqual(['a', 'edited']);
  });

  it('should write an edited target label into the target labels, not into the options', () => {
    component.options.options = ['a', 'b'];
    component.options.targetLabels = ['x', 'y'];
    mockDialogService.showLabelEditDialog.mockReturnValue(of({ text: 'edited' }));

    component.editItem(component.options.targetLabels, 1);

    expect(mockDialogService.showLabelEditDialog).toHaveBeenCalledWith({ text: 'y' });
    expect(component.options.targetLabels).toEqual(['x', 'edited']);
    expect(component.options.options).toEqual(['a', 'b']);
  });

  it('should show an edited item as formatted text, not as its markup', () => {
    component.templateVariant = 'classic';
    component.options.options = ['<p style="margin-bottom: 0px; margin-top: 0px;">edited</p>'];
    fixture.detectChanges();

    const item = fixture.nativeElement.querySelector('.drop-list-option') as HTMLElement;
    expect(item.textContent).toContain('edited');
    expect(item.textContent).not.toContain('<p');
  });

  it('should offer the wrench for text items only', () => {
    component.templateVariant = '2pages';
    component.options.srcUseImages = true;
    component.srcImages = ['data:image/png;base64,abc'];
    component.options.targetLabels = ['x'];
    fixture.detectChanges();

    const iconsPerList = Array.from(fixture.nativeElement.querySelectorAll('.drop-list') as NodeListOf<HTMLElement>)
      .map(list => Array.from(list.querySelectorAll('mat-icon')).map(icon => icon.textContent?.trim()));
    expect(iconsPerList).toEqual([['clear'], ['build', 'clear']]);
  });

  it('should keep the option unchanged when label editing is cancelled', () => {
    component.options.options = ['a'];
    mockDialogService.showLabelEditDialog.mockReturnValue(of(undefined as never));

    component.editItem(component.options.options, 0);

    expect(component.options.options).toEqual(['a']);
  });

  it('should remove a list item', () => {
    component.options.targetLabels = ['x', 'y'];
    component.removeListItem(component.options.targetLabels, 0);
    expect(component.options.targetLabels).toEqual(['y']);
  });

  it('should close the dialog with variant and options on confirm', () => {
    component.templateVariant = 'sort';
    fixture.detectChanges();

    const confirmButton = fixture.nativeElement.querySelector('div[mat-dialog-actions] button') as HTMLButtonElement;
    confirmButton.click();

    expect(mockDialogRef.close).toHaveBeenCalledWith({ variant: 'sort', options: component.options });
  });

  describe('switching images in the two-page variant (#1610)', () => {
    const ELEMENTS = 0;
    const TARGETS = 1;
    /** The element list's controls come first in the two-page variant, the target list's last. */
    const pick = <T extends Element>(selector: string, list: number): T => {
      const matches = Array.from(fixture.nativeElement.querySelectorAll(selector) as NodeListOf<T>);
      return list === ELEMENTS ? matches[0] : matches[matches.length - 1];
    };
    const addTextItem = (list: number, text: string) => {
      const textarea = pick<HTMLTextAreaElement>('textarea', list);
      textarea.value = text;
      textarea.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));
      fixture.detectChanges();
    };
    /** Focuses first, as a click does: a focused text field removed during change detection would blur
        there, and fakeAsync would then hand the appearing image size radios their value mid-check. */
    const toggleImages = (list: number) => {
      const checkbox = pick<HTMLInputElement>('.image-checkbox input', list);
      checkbox.focus();
      checkbox.click();
      fixture.detectChanges();
    };
    const uploadImage = (list: number, dataUrl: string) => {
      vi.spyOn(FileService, 'readFileAsText').mockResolvedValue(dataUrl);
      vi.spyOn(FileService, 'isResizable').mockReturnValue(false);
      const input = pick<HTMLInputElement>('input[type="file"]', list);
      Object.defineProperty(input, 'files', { value: [new File([''], 'test.gif', { type: 'image/gif' })] });
      input.dispatchEvent(new Event('change'));
      flush();
      fixture.detectChanges();
    };
    const itemsOf = (list: number) => (fixture.nativeElement
      .querySelectorAll('.drop-list') as NodeListOf<HTMLElement>)[list].querySelectorAll('.drop-list-option');
    const confirm = () => {
      (fixture.nativeElement.querySelector('div[mat-dialog-actions] button') as HTMLButtonElement).click();
      return mockDialogRef.close.mock.lastCall?.[0].options;
    };

    beforeEach(() => {
      component.templateVariant = '2pages';
      fixture.detectChanges();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should keep text elements out of the images and bring them back when switched off', fakeAsync(() => {
      addTextItem(ELEMENTS, 'Apfel');
      toggleImages(ELEMENTS);

      expect(itemsOf(ELEMENTS).length).toBe(0);

      uploadImage(ELEMENTS, 'data:image/gif;base64,abc');
      expect(confirm()).toEqual(expect.objectContaining({
        srcUseImages: true, options: ['data:image/gif;base64,abc']
      }));

      toggleImages(ELEMENTS);

      expect(itemsOf(ELEMENTS)[0].textContent).toContain('Apfel');
      expect(itemsOf(ELEMENTS).length).toBe(1);
      expect(confirm()).toEqual(expect.objectContaining({ srcUseImages: false, options: ['Apfel'] }));
    }));

    it('should keep text target labels out of the images', fakeAsync(() => {
      toggleImages(ELEMENTS);
      addTextItem(TARGETS, 'Ziel X');
      toggleImages(TARGETS);

      expect(itemsOf(TARGETS).length).toBe(0);

      uploadImage(TARGETS, 'data:image/gif;base64,abc');
      expect(confirm()).toEqual(expect.objectContaining({
        targetUseImages: true, targetLabels: ['data:image/gif;base64,abc']
      }));
    }));

    it('should switch the target images off with the element images', fakeAsync(() => {
      toggleImages(ELEMENTS);
      toggleImages(TARGETS);
      toggleImages(ELEMENTS);
      addTextItem(TARGETS, 'Ziel X');

      expect(fixture.nativeElement.textContent).toContain('sectionTemplates.targetLabelsBelow');
      expect(confirm()).toEqual(expect.objectContaining({
        srcUseImages: false, targetUseImages: false, targetLabels: ['Ziel X']
      }));
    }));
  });
});
