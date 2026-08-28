import { AudioPlayerService } from './audio-player.service';

describe('AudioPlayerService', () => {
  let service: AudioPlayerService;

  beforeEach(() => {
    service = new AudioPlayerService();
    // never play real audio in tests
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create an audio element with the given source on init', () => {
    service.init('test.mp3');
    expect(service.audio).toBeInstanceOf(HTMLAudioElement);
    expect(service.audio.getAttribute('src')).toBe('test.mp3');
  });

  it('should update the source with setSrc', () => {
    service.init('test.mp3');
    service.setSrc('other.mp3');
    expect(service.audio.getAttribute('src')).toBe('other.mp3');
  });

  it('should initialize the audio element and start playback on first play', () => {
    service.play('test.mp3', 'value_1');
    expect(service.audio.getAttribute('src')).toBe('test.mp3');
    expect(service.audio.play).toHaveBeenCalledTimes(1);
  });

  it('should reuse the existing audio element on subsequent plays', () => {
    service.play('first.mp3', 'value_1');
    const firstAudio = service.audio;
    service.play('second.mp3', 'value_2');
    expect(service.audio).toBe(firstAudio);
    expect(service.audio.getAttribute('src')).toBe('second.mp3');
    expect(service.audio.play).toHaveBeenCalledTimes(2);
  });

  it('should clear the source when the audio is paused', () => {
    service.init('test.mp3');
    service.audio.dispatchEvent(new Event('pause'));
    expect(service.audio.getAttribute('src')).toBe('');
  });

  it('should set playingId when play is called', () => {
    service.play('test.mp3', 'value_1');
    expect(service.playingId).toBe('value_1');
  });

  it('should clear playingId when the audio is paused', () => {
    service.play('test.mp3', 'value_1');
    service.audio.dispatchEvent(new Event('pause'));
    expect(service.playingId).toBeNull();
  });
});
