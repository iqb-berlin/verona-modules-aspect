import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { FileService } from 'common/services/file.service';
import { DialogService } from 'editor/src/app/services/dialog.service';
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
      declarations: [MediaSourcePropertiesComponent],
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

  /* Characterizes what an unknown type does today: no branch matches, and the empty defaults are
     emitted anyway - so choosing nothing clears the source. Recorded, not endorsed. */
  it('should emit empty values for an element type it has no file dialog for', async () => {
    const emitted: { property: string; value: unknown }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));

    await component.changeMediaSrc('text-field');

    expect(emitted).toEqual([
      { property: 'src', value: '' },
      { property: 'fileName', value: '' }
    ]);
  });
});
