import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { DragNDropValueObject, TextImageLabel } from 'common/models/label-interfaces';
import { AudioPlayerService } from 'common/services/audio-player.service';
import { SafeResourceHTMLPipe } from 'common/pipes/safe-resource-html.pipe';
import { SafeResourceUrlPipe } from 'common/pipes/safe-resource-url.pipe';
import { TextImagePanelComponent } from './text-image-panel.component';

describe('TextImagePanelComponent', () => {
  let component: TextImagePanelComponent;
  let fixture: ComponentFixture<TextImagePanelComponent>;

  const textImageLabel: TextImageLabel = {
    text: 'Hallo <b>Welt</b>',
    imgSrc: null,
    imgFileName: '',
    imgPosition: 'above'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TextImagePanelComponent,
        SafeResourceHTMLPipe,
        SafeResourceUrlPipe
      ],
      imports: [MatIconModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TextImagePanelComponent);
    component = fixture.componentInstance;
    component.label = { ...textImageLabel };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the label text as HTML', () => {
    const textElement: HTMLElement = fixture.nativeElement.querySelector('.text');
    expect(textElement).toBeTruthy();
    expect(textElement.innerHTML).toContain('<b>Welt</b>');
  });

  it('should not render a text element for an empty label text', () => {
    component.label = { ...textImageLabel, text: '' };
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.text')).toBeNull();
  });

  it('should render an image and apply the position class', () => {
    component.label = {
      ...textImageLabel,
      imgSrc: 'data:image/png;base64,abc',
      imgPosition: 'left'
    };
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img')).toBeTruthy();
    const wrapper: HTMLElement = fixture.nativeElement.querySelector('.image-wrapper');
    expect(wrapper.classList).toContain('row');
  });

  it('should not show an audio button for a label without audio source', () => {
    expect(fixture.nativeElement.querySelector('.audio-button')).toBeNull();
  });

  it('should play audio on mousedown on the audio button', () => {
    const audioPlayerService = TestBed.inject(AudioPlayerService);
    const playSpy = vi.spyOn(audioPlayerService, 'play').mockImplementation(() => {});
    const dragNDropValue: DragNDropValueObject = {
      ...textImageLabel,
      id: 'value-1',
      alias: 'value-1',
      originListID: 'list-1',
      originListIndex: 0,
      audioSrc: 'data:audio/mpeg;base64,abc',
      audioFileName: 'test.mp3'
    };
    component.label = dragNDropValue;
    fixture.detectChanges();
    const audioButton: HTMLElement = fixture.nativeElement.querySelector('.audio-button');
    expect(audioButton).toBeTruthy();
    audioButton.dispatchEvent(new MouseEvent('mousedown'));
    expect(playSpy).toHaveBeenCalledWith('data:audio/mpeg;base64,abc');
  });
});
