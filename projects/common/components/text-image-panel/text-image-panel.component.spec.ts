import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { DragNDropValueObject, TextImageLabel } from 'common/models/label-interfaces';
import { AudioPlayerService } from 'common/services/audio-player.service';
import { SafeResourceHTMLPipe } from 'common/pipes/safe-resource-html.pipe';
import { SafeResourceUrlPipe } from 'common/pipes/safe-resource-url.pipe';
import { HasRenderableContentPipe } from 'common/pipes/has-renderable-content.pipe';
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

  const dragNDropValue: DragNDropValueObject = {
    ...textImageLabel,
    id: 'value-1',
    alias: 'value-1',
    originListID: 'list-1',
    originListIndex: 0,
    audioSrc: 'data:audio/mpeg;base64,abc',
    audioFileName: 'test.mp3'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TextImagePanelComponent,
        SafeResourceHTMLPipe,
        SafeResourceUrlPipe,
        HasRenderableContentPipe
      ],
      imports: [MatIconModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TextImagePanelComponent);
    component = fixture.componentInstance;
    component.label = { ...textImageLabel };
    TestBed.inject(AudioPlayerService).playingId = null;
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

  /* The label is one box of rich text: what belongs to a line stays on it, what is a paragraph of its
     own gets a line of its own. As a flex container this box gave every child a line (#970, #699). */
  it('should keep text and an inline element of one line on the same line', () => {
    component.label = { ...textImageLabel, text: '15 <span>cm</span>' };
    fixture.detectChanges();
    const textElement: HTMLElement = fixture.nativeElement.querySelector('.text');
    const leadingText = document.createRange();
    leadingText.selectNodeContents(textElement.firstChild as Node);
    const inlineElement = textElement.querySelector('span') as HTMLElement;
    expect(leadingText.getBoundingClientRect().top)
      .toBeCloseTo(inlineElement.getBoundingClientRect().top, 0);
  });

  it('should stack the paragraphs of a label below each other', () => {
    component.label = { ...textImageLabel, text: '<p>erster Absatz</p><p>zweiter Absatz</p>' };
    fixture.detectChanges();
    const paragraphs: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.text p'));
    expect(paragraphs.length).toBe(2);
    expect(paragraphs[1].getBoundingClientRect().top)
      .toBeGreaterThanOrEqual(paragraphs[0].getBoundingClientRect().bottom);
  });

  it('should centre a paragraph narrower than the label box', () => {
    component.label = {
      ...textImageLabel,
      text: '<p>ein Absatz, der die Breite des Kastens bestimmt</p><p>kurz</p>'
    };
    fixture.detectChanges();
    const textElement: HTMLElement = fixture.nativeElement.querySelector('.text');
    const shortParagraph = fixture.nativeElement.querySelectorAll('.text p')[1] as HTMLElement;
    const boxRect = textElement.getBoundingClientRect();
    const paragraphRect = shortParagraph.getBoundingClientRect();

    expect(paragraphRect.width).toBeLessThan(boxRect.width);
    expect(paragraphRect.left - boxRect.left).toBeCloseTo(boxRect.right - paragraphRect.right, 0);
  });

  /* With an image above or below it, the text box is as wide as the image; the text belongs in the middle
     of that width, not at its left edge. The width is set here directly -- in a unit it comes from the
     image, which would have to load first. */
  it('should centre the text across a box wider than the text', () => {
    const wrapper: HTMLElement = fixture.nativeElement.querySelector('.image-wrapper');
    wrapper.style.width = '400px';
    const textElement: HTMLElement = fixture.nativeElement.querySelector('.text');
    const content = document.createRange();
    content.selectNodeContents(textElement);
    const wrapperRect = wrapper.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();

    expect(contentRect.width).toBeLessThan(wrapperRect.width);
    expect(contentRect.left - wrapperRect.left).toBeCloseTo(wrapperRect.right - contentRect.right, 0);
  });

  it('should not render a text element for an empty label text', () => {
    component.label = { ...textImageLabel, text: '' };
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.text')).toBeNull();
  });

  /* A rich text editor that has been emptied does not leave '' behind but an empty paragraph, and that
     paragraph took a line's height under the image (#965). */
  it.each(['<p></p>', '<p><br></p>', '<p>   </p>'])(
    'should not render a text element for the emptied rich text %s', text => {
      component.label = { ...textImageLabel, text };
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.text')).toBeNull();
    }
  );

  /* A label can be a picture and nothing else -- no text, and yet everything to draw. */
  it('should render a label text that holds an image and no text', () => {
    component.label = { ...textImageLabel, text: '<p><img src="data:image/png;base64,abc"></p>' };
    fixture.detectChanges();
    const textElement: HTMLElement = fixture.nativeElement.querySelector('.text');
    expect(textElement).toBeTruthy();
    expect(textElement.querySelector('img')).toBeTruthy();
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
    component.label = dragNDropValue;
    fixture.detectChanges();
    const audioButton: HTMLElement = fixture.nativeElement.querySelector('.audio-button');
    expect(audioButton).toBeTruthy();
    audioButton.dispatchEvent(new MouseEvent('mousedown'));
    expect(playSpy).toHaveBeenCalledWith('data:audio/mpeg;base64,abc', 'value-1');
  });

  it('should add is-playing only when this label id is playing', () => {
    const audioPlayerService = TestBed.inject(AudioPlayerService);
    component.label = dragNDropValue;
    audioPlayerService.playingId = 'value-1';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.audio-button').classList).toContain('is-playing');

    audioPlayerService.playingId = 'value-2';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.audio-button').classList).not.toContain('is-playing');
  });

  it('should enlarge the audio button while this label audio is playing', () => {
    const audioPlayerService = TestBed.inject(AudioPlayerService);
    component.label = dragNDropValue;
    fixture.detectChanges();
    const audioButton: HTMLElement = fixture.nativeElement.querySelector('.audio-button');
    const idleSize = audioButton.getBoundingClientRect();

    audioPlayerService.playingId = 'value-1';
    fixture.detectChanges();
    const playingSize = audioButton.getBoundingClientRect();

    expect(getComputedStyle(audioButton).transform).toBe('matrix(1.5, 0, 0, 1.5, 0, 0)');
    expect(playingSize.width).toBeGreaterThan(idleSize.width);
    expect(playingSize.height).toBeGreaterThan(idleSize.height);

    audioPlayerService.playingId = null;
    fixture.detectChanges();
    expect(getComputedStyle(audioButton).transform).toBe('none');
  });

  /* The marker DraggableDirective looks for belongs on the button, not on the icon inside it: the button
     has padding of its own, and a touch landing there is still meant for the audio (#1397). */
  it('should mark the whole audio button as no drag handle', () => {
    component.label = dragNDropValue;
    fixture.detectChanges();
    const audioButton: HTMLElement = fixture.nativeElement.querySelector('.audio-button');
    expect(audioButton.getAttribute('data-draggable-audio')).toBe('true');
  });
});
