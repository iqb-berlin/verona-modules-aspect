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
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { Mock } from 'vitest';
import { DragNDropValueObject, TextImageLabel } from 'common/models/label-interfaces';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { DialogService } from 'editor/src/app/services/dialog.service';
import {
  LabelEditDialogComponent
} from 'editor/src/app/components/dialogs/label-edit-dialog/label-edit-dialog.component';

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

describe('LabelEditDialogComponent', () => {
  let component: LabelEditDialogComponent;
  let fixture: ComponentFixture<LabelEditDialogComponent>;
  let dialogService: SpyObj<DialogService>;
  let dialogRefMock: { close: Mock };

  const configureTestBed = async (label: TextImageLabel): Promise<void> => {
    dialogService = createSpyObj<DialogService>(['importImage']);
    dialogRefMock = { close: vi.fn() };

    await TestBed.configureTestingModule({
      declarations: [
        LabelEditDialogComponent,
        MockRichTextEditorComponent,
        MockTextImagePanelComponent
      ],
      imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatSelectModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { label } },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: DialogService, useValue: dialogService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LabelEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  describe('with an image label', () => {
    let label: TextImageLabel;

    beforeEach(async () => {
      label = {
        text: 'Beschriftung',
        imgSrc: null,
        imgFileName: '',
        imgPosition: 'above'
      };
      await configureTestBed(label);
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should edit a copy of the injected label', () => {
      expect(component.newLabel).toEqual(label);
      expect(component.newLabel).not.toBe(label);

      component.newLabel.text = 'geändert';

      expect(label.text).toBe('Beschriftung');
    });

    it('should show the image panel', () => {
      expect(fixture.nativeElement.querySelector('.image-panel')).toBeTruthy();
    });

    it('should apply the imported image to the copy', async () => {
      dialogService.importImage.mockResolvedValue({ name: 'bild.png', content: 'data:image/png;base64,abc' });

      await component.loadImage();

      expect(component.newLabel.imgSrc).toBe('data:image/png;base64,abc');
      expect(component.newLabel.imgFileName).toBe('bild.png');
    });

    it('should keep the image untouched when the import is cancelled', async () => {
      dialogService.importImage.mockResolvedValue(null);

      await component.loadImage();

      expect(component.newLabel.imgSrc).toBeNull();
      expect(component.newLabel.imgFileName).toBe('');
    });

    it('should close with the edited copy', () => {
      const saveButton = fixture.nativeElement.querySelector('.mat-mdc-dialog-actions button') as HTMLButtonElement;

      saveButton.click();

      expect(dialogRefMock.close).toHaveBeenCalledWith(component.newLabel);
    });
  });

  describe('with a text only label', () => {
    beforeEach(async () => {
      await configureTestBed({ text: 'Nur Text' } as TextImageLabel);
    });

    it('should not show the image panel', () => {
      expect(fixture.nativeElement.querySelector('.image-panel')).toBeNull();
    });
  });
});
