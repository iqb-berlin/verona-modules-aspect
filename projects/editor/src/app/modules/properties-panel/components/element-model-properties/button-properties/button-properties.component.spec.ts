import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { DialogService } from 'editor/src/app/services/dialog.service';
import {
  IsCompressibleImagePipe
} from 'editor/modules/editor-shared/pipes/is-compressible-image.pipe';
import {
  ButtonPropertiesComponent
} from './button-properties.component';

describe('ButtonPropertiesComponent', () => {
  let component: ButtonPropertiesComponent;
  let fixture: ComponentFixture<ButtonPropertiesComponent>;
  let dialogService: SpyObj<DialogService>;

  beforeEach(async () => {
    dialogService = createSpyObj<DialogService>(['showTooltipDialog', 'compressEmbeddedImage']);

    await TestBed.configureTestingModule({
      declarations: [IsCompressibleImagePipe, ButtonPropertiesComponent],
      imports: [
        CommonModule,
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        MatTooltipModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: DialogService, useValue: dialogService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonPropertiesComponent);
    component = fixture.componentInstance;
    component.combinedProperties = {
      asLink: false,
      label: 'Weiter',
      tooltipText: 'old text',
      tooltipPosition: 'below'
    };
    fixture.detectChanges();
  });

  /* The label came from the grab bag, where one control served both the button and the likert. It is
     the same field name but not the same thing - here it is the text on the button, on the likert the
     caption of the options table - so it moved to each owner rather than onto a shared level. */
  it('should show the text on the button and emit an edit', () => {
    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.value).toBe('Weiter');

    const emitted: { property: string; value: unknown }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));
    textarea.value = 'Zurück';
    textarea.dispatchEvent(new Event('input'));

    expect(emitted).toEqual([{ property: 'label', value: 'Zurück' }]);
  });

  it('should render nothing for an element that is not a button', () => {
    component.combinedProperties = {};
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('textarea')).toBeNull();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the edit tooltip button', () => {
    const buttons = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>);
    expect(buttons.some(button => button.textContent?.includes('propertiesPanel.editTooltip'))).toBe(true);
  });

  it('should emit tooltip text and position on save', () => {
    dialogService.showTooltipDialog.mockReturnValue(
      of({ tooltipText: '<p>new text</p>', tooltipPosition: 'above', action: 'save' })
    );
    const emitted: { property: string; value: unknown }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));

    component.editTooltip();

    expect(dialogService.showTooltipDialog).toHaveBeenCalledWith('old text', 'below');
    expect(emitted).toEqual([
      { property: 'tooltipText', value: '<p>new text</p>' },
      { property: 'tooltipPosition', value: 'above' }
    ]);
  });

  it('should emit empty tooltip text on delete', () => {
    dialogService.showTooltipDialog.mockReturnValue(
      of({ tooltipText: 'old text', tooltipPosition: 'below', action: 'delete' })
    );
    const emitted: { property: string; value: unknown }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));

    component.editTooltip();

    expect(emitted).toEqual([{ property: 'tooltipText', value: '' }]);
  });

  it('should not emit anything when the dialog is cancelled', () => {
    dialogService.showTooltipDialog.mockReturnValue(of(undefined as never));
    const emitted: { property: string; value: unknown }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));

    component.editTooltip();

    expect(emitted).toEqual([]);
  });

  it('should pass undefined instead of an empty tooltip text to the dialog', () => {
    dialogService.showTooltipDialog.mockReturnValue(of(undefined as never));
    component.combinedProperties = {
      asLink: false, tooltipText: '', tooltipPosition: 'below'
    };

    component.editTooltip();

    expect(dialogService.showTooltipDialog).toHaveBeenCalledWith(undefined, 'below');
  });

  /* The image on a button gets the same second way in as every other image in the editor: compress
     what is already there, without the file (#1378). */
  describe('the compress button', () => {
    const compressButton = (): HTMLButtonElement | null => {
      const host = fixture.nativeElement as HTMLElement;
      return host.querySelector('.compress-image-button');
    };

    // The image controls belong to the "image" mode of the button; a text button has no image at all.
    it('should stay away while the button carries no image', () => {
      expect(compressButton()).toBeNull();
    });

    it('should be offered for an image that can be scaled', () => {
      component.combinedProperties = { asLink: false, imageSrc: 'data:image/png;base64,abc' };
      fixture.detectChanges();

      expect(compressButton()).not.toBeNull();
      expect(compressButton()?.getAttribute('aria-disabled')).not.toBe('true');
    });

    it('should stay but be disabled for an image no scaler can shrink', () => {
      component.combinedProperties = { asLink: false, imageSrc: 'data:image/svg+xml;base64,abc' };
      fixture.detectChanges();

      expect(compressButton()?.getAttribute('aria-disabled')).toBe('true');
    });
  });

  it('should emit the compressed image', async () => {
    component.combinedProperties = { asLink: false, imageSrc: 'data:image/png;base64,gross' };
    const emitted: { property: string; value: unknown }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));
    dialogService.compressEmbeddedImage.mockResolvedValue('data:image/webp;base64,klein');

    await component.compressImage();

    expect(dialogService.compressEmbeddedImage).toHaveBeenCalledWith('data:image/png;base64,gross');
    expect(emitted).toEqual([{ property: 'imageSrc', value: 'data:image/webp;base64,klein' }]);
  });

  /* The markup grays the button out for a button rendered as a link, but `disabledInteractive` still
     delivers the click - so the handler has to refuse it a second time. A unit that carries both an
     `imageSrc` and `asLink` is not reachable through the toolbar, only through hand-written or
     migrated data. */
  it('should refuse to compress a button that is rendered as a link', async () => {
    component.combinedProperties = { asLink: true, imageSrc: 'data:image/png;base64,gross' };
    const emitted: { property: string; value: unknown }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));
    dialogService.compressEmbeddedImage.mockResolvedValue('data:image/webp;base64,klein');

    await component.compressImage();

    expect(dialogService.compressEmbeddedImage).not.toHaveBeenCalled();
    expect(emitted).toEqual([]);
  });

  it('should emit nothing when the compression is cancelled', async () => {
    component.combinedProperties = { asLink: false, imageSrc: 'data:image/png;base64,gross' };
    const emitted: { property: string; value: unknown }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));
    dialogService.compressEmbeddedImage.mockResolvedValue(null);

    await component.compressImage();

    expect(emitted).toEqual([]);
  });
});
