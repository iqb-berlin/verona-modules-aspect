// eslint-disable-next-line max-classes-per-file
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { Mock } from 'vitest';
import { DragNDropValueObject, TextImageLabel } from 'common/models/label-interfaces';
import { FileService } from 'common/services/file.service';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { IDService } from 'editor/src/app/services/id.service';
import {
  DropListOptionEditDialogComponent
} from 'editor/src/app/components/dialogs/drop-list-option-edit-dialog/drop-list-option-edit-dialog.component';
import {
  IsCompressibleImagePipe
} from 'editor/modules/editor-shared/pipes/is-compressible-image.pipe';

@Component({
  selector: 'aspect-rich-text-editor',
  template: '',
  standalone: false
})
class MockRichTextEditorComponent {
  @Input() content!: string | Record<string, unknown>;
  @Input() showReducedControls: boolean = false;
  @Output() contentChange = new EventEmitter<string>();
}

@Component({
  selector: 'aspect-text-image-panel',
  template: '',
  standalone: false
})
class MockTextImagePanelComponent {
  @Input() label!: TextImageLabel | DragNDropValueObject;
}

describe('DropListOptionEditDialogComponent', () => {
  let component: DropListOptionEditDialogComponent;
  let fixture: ComponentFixture<DropListOptionEditDialogComponent>;
  let dialogService: SpyObj<DialogService>;
  let dialogRefMock: { close: Mock };
  let idService: SpyObj<IDService>;

  const createValue = (): DragNDropValueObject => ({
    text: 'Option 1',
    imgSrc: null,
    imgFileName: '',
    imgPosition: 'above',
    id: 'value_1',
    alias: 'value_1',
    originListID: 'drop-list_1',
    originListIndex: 0,
    audioSrc: null,
    audioFileName: ''
  });

  let value: DragNDropValueObject;

  beforeEach(async () => {
    value = createValue();
    dialogService = createSpyObj<DialogService>(['importImage', 'compressEmbeddedImage']);
    dialogRefMock = { close: vi.fn() };
    idService = createSpyObj<IDService>(['isAliasAvailable']);
    idService.isAliasAvailable.mockReturnValue(true);

    await TestBed.configureTestingModule({
      declarations: [
        DropListOptionEditDialogComponent,
        IsCompressibleImagePipe,
        MockRichTextEditorComponent,
        MockTextImagePanelComponent
      ],
      imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatTooltipModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { value } },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: DialogService, useValue: dialogService },
        { provide: IDService, useValue: idService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DropListOptionEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should work on a copy of the injected value', () => {
    expect(component.newLabel).toEqual(value);
    expect(component.newLabel).not.toBe(value);

    component.newLabel.text = 'geändert';

    expect(value.text).toBe('Option 1');
  });

  it('should apply the imported image to the copy', async () => {
    dialogService.importImage.mockResolvedValue({ name: 'bild.png', content: 'data:image/png;base64,abc' });

    await component.loadImage();

    expect(component.newLabel.imgSrc).toBe('data:image/png;base64,abc');
    expect(component.newLabel.imgFileName).toBe('bild.png');
  });

  it('should keep the image untouched when the import is cancelled', async () => {
    component.newLabel.imgSrc = 'data:image/png;base64,old';
    component.newLabel.imgFileName = 'alt.png';
    dialogService.importImage.mockResolvedValue(null);

    await component.loadImage();

    expect(component.newLabel.imgSrc).toBe('data:image/png;base64,old');
    expect(component.newLabel.imgFileName).toBe('alt.png');
  });

  it('should apply the loaded audio to the copy', async () => {
    vi.spyOn(FileService, 'loadAudio')
      .mockResolvedValue({ name: 'ton.mp3', content: 'data:audio/mp3;base64,abc' });

    await component.loadAudio();

    expect(component.newLabel.audioSrc).toBe('data:audio/mp3;base64,abc');
    expect(component.newLabel.audioFileName).toBe('ton.mp3');
  });

  it('should close with the edited copy', async () => {
    // the save button stays disabled until NgModel has published its validity
    await fixture.whenStable();
    fixture.detectChanges();
    const saveButton = fixture.nativeElement.querySelector('.mat-mdc-dialog-actions button') as HTMLButtonElement;

    saveButton.click();

    expect(dialogRefMock.close).toHaveBeenCalledWith(component.newLabel);
  });

  it('should disable saving for an invalid alias', () => {
    const aliasInput = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    aliasInput.value = 'ungültige ID';
    aliasInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const saveButton = fixture.nativeElement.querySelector('.mat-mdc-dialog-actions button') as HTMLButtonElement;
    expect(saveButton.disabled).toBe(true);
  });

  /* The drop-list refused a taken alias only after the dialog had closed, with a message that faded (#1523). */
  it('should say at the field that an alias is taken, and disable saving', async () => {
    idService.isAliasAvailable.mockReturnValue(false);
    const aliasInput = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    aliasInput.value = 'vergeben';
    aliasInput.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(idService.isAliasAvailable).toHaveBeenCalledWith('vergeben', 'value_1');
    expect(fixture.nativeElement.querySelector('.alias-problem-hint').textContent).toContain('idTaken');
    const saveButton = fixture.nativeElement.querySelector('.mat-mdc-dialog-actions button') as HTMLButtonElement;
    expect(saveButton.disabled).toBe(true);
  });

  /* The reason is the one the drop-list would give: a space is named as such, not as some invalid character. */
  it('should name the reason the drop-list would refuse an alias for', async () => {
    const aliasInput = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    aliasInput.value = 'Option A';
    aliasInput.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.alias-problem-hint').textContent).toContain('idContainsSpace');

    aliasInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-error').textContent).toContain('idContainsSpace');

    aliasInput.value = 'option_a';
    aliasInput.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.alias-problem-hint')).toBeNull();
    expect(fixture.nativeElement.querySelector('mat-error')).toBeNull();
  });

  /* Compressing an image that is already there: the dialog is the way in, `compressEmbeddedImage`
     does the work, and only the result reaches the copy under edit (#1378). */
  it('should apply the compressed image to the copy', async () => {
    component.newLabel.imgSrc = 'data:image/png;base64,gross';
    dialogService.compressEmbeddedImage.mockResolvedValue('data:image/webp;base64,klein');

    await component.compressImage();

    expect(dialogService.compressEmbeddedImage).toHaveBeenCalledWith('data:image/png;base64,gross');
    expect(component.newLabel.imgSrc).toBe('data:image/webp;base64,klein');
  });

  // A cancelled dialog answers null, and the image has to stay exactly as it was.
  it('should keep the image untouched when the compression is cancelled', async () => {
    component.newLabel.imgSrc = 'data:image/png;base64,gross';
    dialogService.compressEmbeddedImage.mockResolvedValue(null);

    await component.compressImage();

    expect(component.newLabel.imgSrc).toBe('data:image/png;base64,gross');
  });
});
