import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule } from '@ngx-translate/core';
import { Mock } from 'vitest';
import { PlayerProperties, PropertyGroupGenerators } from 'common/models/elements/property-group-interfaces';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { UnitService } from 'editor/src/app/services/unit.service';
import {
  GetValidAudioVideoAliasAndIDsPipe
} from 'editor/src/app/pipes/get-valid-audio-video-alias-and-ids.pipe';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { MessageService } from 'editor/src/app/services/message.service';
import {
  PlayerEditDialogComponent
} from 'editor/src/app/components/dialogs/player-edit-dialog/player-edit-dialog.component';
import {
  NumberFieldDirective
} from 'editor/modules/editor-shared/directives/number-field.directive';

describe('PlayerEditDialogComponent', () => {
  let component: PlayerEditDialogComponent;
  let fixture: ComponentFixture<PlayerEditDialogComponent>;
  let dialogService: SpyObj<DialogService>;
  let dialogRefMock: { close: Mock };
  let messageService: SpyObj<MessageService>;
  let playerProps: PlayerProperties;

  beforeEach(async () => {
    playerProps = PropertyGroupGenerators.generatePlayerProps({
      imgSrc: 'data:image/png;base64,old',
      imgFileName: 'alt.png',
      minRuns: 2
    });
    dialogService = createSpyObj<DialogService>(['importImage']);
    messageService = createSpyObj<MessageService>(['showWarning']);
    dialogRefMock = { close: vi.fn() };
    const unitServiceMock = {
      unit: { getAllElements: () => [] }
    } as unknown as UnitService;

    await TestBed.configureTestingModule({
      declarations: [PlayerEditDialogComponent,
        GetValidAudioVideoAliasAndIDsPipe, NumberFieldDirective],
      imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatTabsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { elementID: 'audio_1', playerProps } },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: DialogService, useValue: dialogService },
        { provide: UnitService, useValue: unitServiceMock },
        { provide: MessageService, useValue: messageService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should edit a copy of the injected player properties', () => {
    expect(component.newPlayerConfig).toEqual(playerProps);
    expect(component.newPlayerConfig).not.toBe(playerProps);

    component.newPlayerConfig.minRuns = 5;

    expect(playerProps.minRuns).toBe(2);
  });

  it('should apply the imported image to the copy', async () => {
    dialogService.importImage.mockResolvedValue({ name: 'neu.png', content: 'data:image/png;base64,new' });

    await component.loadImage();

    expect(component.newPlayerConfig.imgSrc).toBe('data:image/png;base64,new');
    expect(component.newPlayerConfig.imgFileName).toBe('neu.png');
  });

  it('should keep the image untouched when the import is cancelled', async () => {
    dialogService.importImage.mockResolvedValue(null);

    await component.loadImage();

    expect(component.newPlayerConfig.imgSrc).toBe('data:image/png;base64,old');
    expect(component.newPlayerConfig.imgFileName).toBe('alt.png');
  });

  it('should reset image source and file name when removing the image', () => {
    component.removeImage();

    expect(component.newPlayerConfig.imgSrc).toBeNull();
    expect(component.newPlayerConfig.imgFileName).toBe('');
    expect(playerProps.imgSrc).toBe('data:image/png;base64,old');
  });

  it('should close with the edited player configuration', () => {
    const saveButton = fixture.nativeElement.querySelector('.mat-mdc-dialog-actions button') as HTMLButtonElement;

    saveButton.click();

    expect(dialogRefMock.close).toHaveBeenCalledWith(component.newPlayerConfig);
  });

  /* The five number boxes carried `min`/`max` and nothing enforced them, so a negative volume or
     run count could be confirmed (#1161). The draft assignment itself was fine - the dialog only
     hands its copy back on confirm - but the binding had to become one-way for the directive. */
  describe('the number boxes', () => {
    const volumeBox = (): HTMLInputElement => fixture.nativeElement
      .querySelector('input[type="number"]') as HTMLInputElement;
    const edit = async (box: HTMLInputElement, value: string): Promise<void> => {
      box.value = value;
      box.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      box.dispatchEvent(new Event('blur'));
      fixture.detectChanges();
      await fixture.whenStable();
    };

    it('should take an edited volume into the draft', async () => {
      await edit(volumeBox(), '0.5');

      expect(component.newPlayerConfig.defaultVolume).toBe(0.5);
    });

    /* `max="1"` counts too, not just the minimum - the directive reads whatever validators the
       box declares. */
    it('should refuse a volume above the maximum', async () => {
      const before = component.newPlayerConfig.defaultVolume;

      await edit(volumeBox(), '5');

      expect(component.newPlayerConfig.defaultVolume).toBe(before);
      expect(volumeBox().value).toBe(String(before));
    });

    /* The box goes back to its old value on its own, so without a word for it the edit looks
       swallowed - the panel says the same thing at its own boxes. */
    it('should say why a refused entry disappeared', async () => {
      await edit(volumeBox(), '5');

      expect(messageService.showWarning).toHaveBeenCalledTimes(1);
    });

    it('should stay quiet for an entry it takes', async () => {
      await edit(volumeBox(), '0.5');

      expect(messageService.showWarning).not.toHaveBeenCalled();
    });
  });
});
