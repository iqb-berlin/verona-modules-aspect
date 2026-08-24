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
import { TranslateModule } from '@ngx-translate/core';
import { Mock } from 'vitest';
import { DragNDropValueObject, TextImageLabel } from 'common/models/label-interfaces';
import { FileService } from 'common/services/file.service';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { DialogService } from 'editor/src/app/services/dialog.service';
import {
  DropListOptionEditDialogComponent
} from 'editor/src/app/components/dialogs/drop-list-option-edit-dialog/drop-list-option-edit-dialog.component';

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
    dialogService = createSpyObj<DialogService>(['importImage']);
    dialogRefMock = { close: vi.fn() };

    await TestBed.configureTestingModule({
      declarations: [
        DropListOptionEditDialogComponent,
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
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { value } },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: DialogService, useValue: dialogService }
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
});
