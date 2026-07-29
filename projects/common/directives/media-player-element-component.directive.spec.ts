import { ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { AudioElement } from 'common/models/elements/media-player-group-elements/audio';
import { MediaPlayerElementComponent } from './media-player-element-component.directive';

/* The base class of the audio and video components. It carries the two pieces of cross-element state
   that a single media component cannot know on its own:
   - `active`: only one media element may play at a time, so it listens for who is playing
   - `dependencyDissolved`: an element can be configured to stay locked until another one has been
     played (`player.activeAfterID`), so it listens for elements reporting that they finished

   Both arrive through subjects the unit owns. Neither input is guaranteed - the editor renders these
   components without them - so the subscriptions are conditional. */
class TestMediaPlayerElementComponent extends MediaPlayerElementComponent {
  elementModel: AudioElement;

  constructor(id: string, activeAfterID: string = '', alias: string = 'Ton', fileName: string = 'ton.mp3') {
    super(new ElementRef(document.createElement('div')));
    this.elementModel = {
      id, alias, fileName, player: { activeAfterID }
    } as unknown as AudioElement;
  }
}

describe('MediaPlayerElementComponent', () => {
  let actualPlayingId: Subject<string | null>;
  let mediaStatusChanged: Subject<string>;

  const initComponent = (component: TestMediaPlayerElementComponent): TestMediaPlayerElementComponent => {
    component.actualPlayingId = actualPlayingId;
    component.mediaStatusChanged = mediaStatusChanged;
    component.ngOnInit();
    return component;
  };

  beforeEach(() => {
    actualPlayingId = new Subject<string | null>();
    mediaStatusChanged = new Subject<string>();
  });

  it('should start out active and not yet loaded', () => {
    const component = new TestMediaPlayerElementComponent('audio_1');

    expect(component.active).toBe(true);
    expect(component.isLoaded.value).toBe(false);
  });

  describe('dependency on another element', () => {
    it('should start dissolved when the element does not wait for another one', () => {
      const component = initComponent(new TestMediaPlayerElementComponent('audio_1'));

      expect(component.dependencyDissolved).toBe(true);
    });

    it('should start undissolved when the element waits for another one', () => {
      const component = initComponent(new TestMediaPlayerElementComponent('audio_1', 'audio_2'));

      expect(component.dependencyDissolved).toBe(false);
    });

    it('should dissolve the dependency when the awaited element reports in', () => {
      const component = initComponent(new TestMediaPlayerElementComponent('audio_1', 'audio_2'));

      mediaStatusChanged.next('audio_2');

      expect(component.dependencyDissolved).toBe(true);
    });

    it('should keep waiting when another element reports in', () => {
      const component = initComponent(new TestMediaPlayerElementComponent('audio_1', 'audio_2'));

      mediaStatusChanged.next('audio_3');

      expect(component.dependencyDissolved).toBe(false);
    });

    /* Once dissolved it stays dissolved - the guard in setActivatedAfterID exists for exactly this,
       so a later report from a different element cannot lock the media again. */
    it('should not re-lock once the dependency is dissolved', () => {
      const component = initComponent(new TestMediaPlayerElementComponent('audio_1', 'audio_2'));
      mediaStatusChanged.next('audio_2');

      mediaStatusChanged.next('audio_3');

      expect(component.dependencyDissolved).toBe(true);
    });
  });

  describe('only one element playing at a time', () => {
    it('should go inactive while another element is playing', () => {
      const component = initComponent(new TestMediaPlayerElementComponent('audio_1'));

      actualPlayingId.next('audio_2');

      expect(component.active).toBe(false);
    });

    it('should stay active while it is the one playing', () => {
      const component = initComponent(new TestMediaPlayerElementComponent('audio_1'));

      actualPlayingId.next('audio_1');

      expect(component.active).toBe(true);
    });

    it('should become active again when nothing is playing', () => {
      const component = initComponent(new TestMediaPlayerElementComponent('audio_1'));
      actualPlayingId.next('audio_2');

      actualPlayingId.next(null);

      expect(component.active).toBe(true);
    });
  });

  /* The editor renders these components without the unit's subjects, so ngOnInit has to cope with
     both inputs being absent. */
  it('should initialise without the unit subjects', () => {
    const component = new TestMediaPlayerElementComponent('audio_1', 'audio_2');

    expect(() => component.ngOnInit()).not.toThrow();
    expect(component.dependencyDissolved).toBe(false);
    expect(component.active).toBe(true);
  });

  it('should stop listening to both subjects when destroyed', () => {
    const component = initComponent(new TestMediaPlayerElementComponent('audio_1', 'audio_2'));

    component.ngOnDestroy();
    actualPlayingId.next('audio_2');
    mediaStatusChanged.next('audio_2');

    expect(component.active).toBe(true);
    expect(component.dependencyDissolved).toBe(false);
  });

  describe('error messages', () => {
    it('should name alias and file in the timeout message', () => {
      const component = new TestMediaPlayerElementComponent('audio_1', '', 'Hörtext 1', 'hoertext.mp3');

      expect(component.timeoutMsg)
        .toBe('Failed to load media element with alias "Hörtext 1" and filename "hoertext.mp3" in time');
    });

    it('should name alias and file in the missing duration message', () => {
      const component = new TestMediaPlayerElementComponent('audio_1', '', 'Hörtext 1', 'hoertext.mp3');

      expect(component.mediaDurationNotAvailableMsg)
        .toBe('Media duration of element with alias "Hörtext 1" and filename "hoertext.mp3" is not available');
    });
  });
});
