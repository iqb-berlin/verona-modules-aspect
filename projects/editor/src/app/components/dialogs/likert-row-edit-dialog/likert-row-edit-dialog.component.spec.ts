// eslint-disable-next-line max-classes-per-file
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { Mock } from 'vitest';
import {
  LikertRowElement, LikertRowProperties
} from 'common/models/elements/compound-group-elements/likert/likert-row';
import { DragNDropValueObject, TextImageLabel, TextLabel } from 'common/models/label-interfaces';
import { SafeResourceHTMLPipe } from 'common/pipes/safe-resource-html.pipe';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { DialogService } from 'editor/src/app/services/dialog.service';
import {
  LikertRowEditDialogComponent
} from 'editor/src/app/components/dialogs/likert-row-edit-dialog/likert-row-edit-dialog.component';

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

describe('LikertRowEditDialogComponent', () => {
  let component: LikertRowEditDialogComponent;
  let fixture: ComponentFixture<LikertRowEditDialogComponent>;
  let dialogService: SpyObj<DialogService>;
  let dialogRefMock: { close: Mock };
  let row: LikertRowElement;

  const options: TextLabel[] = [{ text: 'trifft zu' }, { text: 'trifft nicht zu' }];

  beforeEach(async () => {
    row = new LikertRowElement({
      type: 'likert-row',
      id: 'likert-row_1',
      alias: 'likert-row_1',
      rowLabel: {
        text: 'Zeile 1',
        imgSrc: null,
        imgFileName: '',
        imgPosition: 'above'
      }
    } as Partial<LikertRowProperties>);
    dialogService = createSpyObj<DialogService>(['importImage']);
    dialogRefMock = { close: vi.fn() };

    await TestBed.configureTestingModule({
      declarations: [
        LikertRowEditDialogComponent,
        MockRichTextEditorComponent,
        MockTextImagePanelComponent,
        SafeResourceHTMLPipe
      ],
      imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { row, options } },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: DialogService, useValue: dialogService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LikertRowEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const getSaveButton = (): HTMLButtonElement => fixture.nativeElement
    .querySelector('.mat-mdc-dialog-actions button') as HTMLButtonElement;

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should edit a detached copy of the injected row', () => {
    expect(component.newLikertRow).toBeInstanceOf(LikertRowElement);
    expect(component.newLikertRow).not.toBe(row);
    expect(component.newLikertRow.id).toBe('likert-row_1');
    expect(component.newLikertRow.rowLabel).not.toBe(row.rowLabel);
    expect(component.newLikertRow.rowLabel.text).toBe('Zeile 1');

    component.newLikertRow.rowLabel.text = 'geändert';

    expect(row.rowLabel.text).toBe('Zeile 1');
  });

  it('should apply the imported image to the copied row label', async () => {
    dialogService.importImage.mockResolvedValue({ name: 'bild.png', content: 'data:image/png;base64,abc' });

    await component.loadImage();

    expect(component.newLikertRow.rowLabel.imgSrc).toBe('data:image/png;base64,abc');
    expect(component.newLikertRow.rowLabel.imgFileName).toBe('bild.png');
    expect(row.rowLabel.imgSrc).toBeNull();
  });

  it('should keep the image untouched when the import is cancelled', async () => {
    dialogService.importImage.mockResolvedValue(null);

    await component.loadImage();

    expect(component.newLikertRow.rowLabel.imgSrc).toBeNull();
  });

  it('should disable saving for an invalid alias', () => {
    const aliasInput = fixture.nativeElement.querySelector('input[type="text"]') as HTMLInputElement;
    aliasInput.value = 'ungültige ID';
    aliasInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(getSaveButton().disabled).toBe(true);
  });

  it('should close with the edited row', async () => {
    // the save button stays disabled until NgModel has published its validity
    await fixture.whenStable();
    fixture.detectChanges();
    getSaveButton().click();

    expect(dialogRefMock.close).toHaveBeenCalledWith(component.newLikertRow);
  });
});
