import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { FileService } from 'common/services/file.service';
import { DialogService } from 'editor/src/app/services/dialog.service';
import {
  MergedMarkerComponent
} from 'editor/modules/editor-shared/components/merged-marker/merged-marker.component';
import {
  MediaSourcePropertiesComponent
} from './media-source-properties.component';

describe('MediaSourcePropertiesComponent', () => {
  let component: MediaSourcePropertiesComponent;
  let fixture: ComponentFixture<MediaSourcePropertiesComponent>;

  const fileName = () => fixture.debugElement.query(By.css('.file-name'));
  const sourceButton = () => fixture.debugElement.query(By.css('.media-src-button'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MediaSourcePropertiesComponent, MergedMarkerComponent],
      imports: [
        MatIconModule,
        MatTooltipModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: DialogService, useValue: {} }
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
});
