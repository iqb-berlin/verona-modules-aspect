import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { FileService } from 'common/services/file.service';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { DialogService } from 'editor/src/app/services/dialog.service';
import {
  MergedMarkerComponent
} from 'editor/modules/editor-shared/components/merged-marker/merged-marker.component';
import {
  IsCompressibleImagePipe
} from 'editor/modules/editor-shared/pipes/is-compressible-image.pipe';
import {
  MediaSourcePropertiesComponent
} from './media-source-properties.component';

describe('MediaSourcePropertiesComponent', () => {
  let component: MediaSourcePropertiesComponent;
  let fixture: ComponentFixture<MediaSourcePropertiesComponent>;
  let dialogService: SpyObj<DialogService>;

  const fileName = () => fixture.debugElement.query(By.css('.file-name'));
  const sourceButton = () => fixture.debugElement.query(By.css('.media-src-button'));
  const compressButton = () => fixture.debugElement.query(By.css('.compress-image-button'));

  beforeEach(async () => {
    dialogService = createSpyObj<DialogService>(['compressEmbeddedImage']);

    await TestBed.configureTestingModule({
      declarations: [MediaSourcePropertiesComponent,
        IsCompressibleImagePipe, MergedMarkerComponent],
      imports: [
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: DialogService, useValue: dialogService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MediaSourcePropertiesComponent);
    component = fixture.componentInstance;
    component.combinedProperties = {
      type: 'audio', fileName: 'ton.mp3', src: 'data:audio/mp3;base64,abc'
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the file name and the source button for a media element', () => {
    expect(fileName().nativeElement.textContent).toContain('ton.mp3');
    expect(sourceButton()).not.toBeNull();
  });

  /* Geometry references a file but has no src, which is why the two controls guard themselves
     separately rather than sharing one condition. */
  it('should show the file name without the source button when there is no src', () => {
    component.combinedProperties = { type: 'geometry', fileName: 'kreis.ggb' };
    fixture.detectChanges();

    expect(fileName()).not.toBeNull();
    expect(sourceButton()).toBeNull();
  });

  // The component is bound for every element type, so both controls have to stay away otherwise.
  it('should render nothing for an element without a file', () => {
    component.combinedProperties = { type: 'text-field' };
    fixture.detectChanges();

    expect(fileName()).toBeNull();
    expect(sourceButton()).toBeNull();
  });

  /* An element that has the property but no file yet still shows the readout - with a placeholder,
     because that is the slot the name will appear in once a file is chosen. */
  it('should show the placeholder while no file has been chosen', () => {
    component.combinedProperties = { type: 'audio', fileName: '', src: null };
    fixture.detectChanges();

    expect(fileName()).not.toBeNull();
    expect(fileName().nativeElement.textContent).toContain('unknown');
    expect(sourceButton()).toBeNull();
  });

  it('should emit both the source and the file name when the media is replaced', async () => {
    const emitted: { property: string; value: unknown }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));
    vi.spyOn(FileService, 'loadAudio')
      .mockResolvedValue({ name: 'neu.mp3', content: 'data:audio/mp3;base64,def' });

    await component.changeMediaSrc('audio');

    expect(emitted).toEqual([
      { property: 'src', value: 'data:audio/mp3;base64,def' },
      { property: 'fileName', value: 'neu.mp3' }
    ]);
  });

  /* Replacing the file leaves the hotspots at their old coordinates just as compressing would, so
     the dialog is told about them on this way in as well (#1399). */
  it('should tell the resize dialog about the hotspots when the file is replaced', async () => {
    component.combinedProperties = {
      type: 'hotspot-image', fileName: 'bild.png', src: 'data:image/png;base64,abc'
    };
    const showImageResizeDialog = vi.fn().mockReturnValue(of({ maxWidth: 100 }));
    (dialogService as unknown as { showImageResizeDialog: unknown }).showImageResizeDialog =
      showImageResizeDialog;
    vi.spyOn(FileService, 'getRawFile')
      .mockResolvedValue(new File([''], 'neu.png', { type: 'image/png' }));
    vi.spyOn(FileService, 'readFileAsText').mockResolvedValue('data:image/png;base64,neu');
    vi.spyOn(FileService, 'scaleImage').mockResolvedValue('data:image/png;base64,klein');

    await component.changeMediaSrc('hotspot-image');

    expect(showImageResizeDialog)
      .toHaveBeenCalledWith('data:image/png;base64,neu', {}, false, true);
  });

  /* No branch matches, so there is no file to write - and writing the empty defaults would clear
     the source of every selected element instead (#1152). */
  it('should emit nothing for an element type it has no file dialog for', async () => {
    const emitted: { property: string; value: unknown }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));

    await component.changeMediaSrc('text-field');

    expect(emitted).toEqual([]);
  });

  /* The type of a selection of mixed element types merges to null, and the dialog to open follows
     from the type - so the panel does not offer the button in the first place (#1152). */
  it('should hide the source button when the element types disagree', () => {
    component.combinedProperties = {
      type: null, fileName: 'bild.png', src: 'data:image/png;base64,abc'
    };
    fixture.detectChanges();

    expect(fileName()).not.toBeNull();
    expect(sourceButton()).toBeNull();
  });

  /* Two elements of the SAME type holding different files merge both halves to null. The button
     used to go with them, so there was no way left to give the selection one new file - while the
     name beside it read "unknown", which is what an element without a file says and the one state
     these are not. `src` cannot tell the two apart (it is nullable, and null is also "no file"),
     `fileName` can (#1138). */
  describe('a selection whose files differ', () => {
    beforeEach(() => {
      component.combinedProperties = { type: 'audio', fileName: null, src: null };
      fixture.detectChanges();
    });

    it('should keep the source button', () => {
      expect(sourceButton()).not.toBeNull();
    });

    /* Empty plus the marker, the same thing every field in the panel says for this - and above all
       not "unknown", which is what an element without a file says. */
    it('should mark the readout instead of claiming there is no file', () => {
      expect(fileName().query(By.css('aspect-merged-marker'))).not.toBeNull();
      expect(fileName().nativeElement.textContent).not.toContain('unknown');
    });

    /* Geometry names a file but keeps no src, so there is nothing for this button to replace - it
       has to stay away even though the names differ, which the readout above still reports. */
    it('should keep the button away where the element has no src at all', () => {
      component.combinedProperties = { type: 'geometry', fileName: null };
      fixture.detectChanges();

      expect(sourceButton()).toBeNull();
      expect(fileName().query(By.css('aspect-merged-marker'))).not.toBeNull();
    });
  });

  /* Compressing what is already in the unit. Audio and video do not get it: they carry their file in
     the same property, and that one is not scaled. Bildbereiche do get it -- the dialog is told they
     carry hotspots and warns about a size change on its own (#1378, #1399). */
  describe('the compress button', () => {
    it('should be offered for an image that can be scaled', () => {
      component.combinedProperties = {
        type: 'image', fileName: 'bild.png', src: 'data:image/png;base64,abc'
      };
      fixture.detectChanges();

      expect(compressButton()).not.toBeNull();
      expect(compressButton().nativeElement.getAttribute('aria-disabled')).not.toBe('true');
    });

    /* Disabled rather than hidden: an SVG has nothing to scale away, and a button that appears and
       vanishes between elements says less than one that stays and explains itself. It is disabled
       the `disabledInteractive` way, which is aria-disabled and not the native attribute - that is
       what leaves it able to show the tooltip that names the reason. */
    it('should stay but be disabled for an image no scaler can shrink', () => {
      component.combinedProperties = {
        type: 'image', fileName: 'bild.svg', src: 'data:image/svg+xml;base64,abc'
      };
      fixture.detectChanges();

      expect(compressButton()).not.toBeNull();
      expect(compressButton().nativeElement.getAttribute('aria-disabled')).toBe('true');
      expect(compressButton().injector.get(MatTooltip).message).toBe('compressImageUnavailable');
    });

    it('should stay away for media that is not an image', () => {
      component.combinedProperties = {
        type: 'audio', fileName: 'ton.mp3', src: 'data:audio/mp3;base64,abc'
      };
      fixture.detectChanges();

      expect(compressButton()).toBeNull();
    });

    it('should be offered for Bildbereiche as well', () => {
      component.combinedProperties = {
        type: 'hotspot-image', fileName: 'bild.png', src: 'data:image/png;base64,abc'
      };
      fixture.detectChanges();

      expect(compressButton()).not.toBeNull();
    });

    it('should stay away while the element holds no image', () => {
      component.combinedProperties = { type: 'image', fileName: '', src: null };
      fixture.detectChanges();

      expect(compressButton()).toBeNull();
    });
  });

  it('should emit the compressed image without touching the file name', async () => {
    component.combinedProperties = {
      type: 'image', fileName: 'bild.png', src: 'data:image/png;base64,gross'
    };
    const emitted: { property: string; value: unknown }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));
    dialogService.compressEmbeddedImage.mockResolvedValue('data:image/webp;base64,klein');

    await component.compressImage();

    expect(dialogService.compressEmbeddedImage).toHaveBeenCalledWith('data:image/png;base64,gross', false);
    expect(emitted).toEqual([{ property: 'src', value: 'data:image/webp;base64,klein' }]);
  });

  /* The dialog can only warn about the hotspots if it is told they are there, and this is the one
     element that has them - the flag decides whether the warning appears at all (#1399). */
  it('should tell the dialog that a Bildbereiche element has hotspots pinned to the image', async () => {
    component.combinedProperties = {
      type: 'hotspot-image', fileName: 'bild.png', src: 'data:image/png;base64,gross'
    };
    dialogService.compressEmbeddedImage.mockResolvedValue('data:image/webp;base64,klein');

    await component.compressImage();

    expect(dialogService.compressEmbeddedImage).toHaveBeenCalledWith('data:image/png;base64,gross', true);
  });

  /* Null rather than the unchanged image, so nothing is written back into every selected element
     when the dialog is cancelled. */
  it('should emit nothing when the compression is cancelled', async () => {
    component.combinedProperties = {
      type: 'image', fileName: 'bild.png', src: 'data:image/png;base64,gross'
    };
    const emitted: { property: string; value: unknown }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));
    dialogService.compressEmbeddedImage.mockResolvedValue(null);

    await component.compressImage();

    expect(emitted).toEqual([]);
  });
});
