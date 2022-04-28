import { TestBed } from '@angular/core/testing';
import { MediaPlayerService } from './media-player.service';


describe('MediaPlayerService', () => {
  let service: MediaPlayerService;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MediaPlayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('mediaStatus of audio_1 should be changed', () => {
    const mediaId = 'audio_1';
    service.registerMediaElement(mediaId, false);
    service.setValidStatusChanged(mediaId);
    service.mediaStatusChanged
      .subscribe( id => expect(id).toEqual(mediaId));
  });

  it('mediaStatus of audio_1 should be changed', () => {
    const mediaId = 'audio_1';
    service.registerMediaElement(mediaId, false);
    service.registerMediaElement('audio_2', false);
    service.setValidStatusChanged(mediaId);
    service.mediaStatusChanged
      .subscribe( id => expect(id).toEqual(mediaId));
  });

  it('mediaStatus of audio_2 should not be changed', () => {
    const mediaId = 'audio_1';
    service.registerMediaElement(mediaId, false);
    service.registerMediaElement('audio_2', false);
    service.setValidStatusChanged('audio_2');
    service.mediaStatusChanged
      .subscribe( id => expect(id).not.toEqual(mediaId));
  });

  it('mediaStatus should be complete', () => {
    expect(service.mediaStatus).toEqual('complete');
  });

  it('mediaStatus should be complete', () => {
    service.registerMediaElement('audio_1', true);
    expect(service.mediaStatus).toEqual('complete');
  });

  it('mediaStatus should be none', () => {
    service.registerMediaElement('audio_1', false);
    expect(service.mediaStatus).toEqual('none');
  });

  it('mediaStatus should be none', () => {
    service.registerMediaElement('audio_1', false);
    service.registerMediaElement('audio_2', true);
    expect(service.mediaStatus).toEqual('some');
  });

  it('mediaStatus should be complete', () => {
    service.registerMediaElement('audio_1', false);
    service.setValidStatusChanged('audio_1');
    expect(service.mediaStatus).toEqual('complete');
  });

  it('actualPlayingMediaId should be audio_1', () => {
    const mediaId = 'audio_1';
    service.actualPlayingId
      .subscribe( id => expect(id).toEqual(mediaId));
    service.setActualPlayingId(mediaId);
  });

  it('pageIndex should not be audio_1', () => {
    const mediaId = 'audio_1';
    service.actualPlayingId
      .subscribe( id => expect(id).not.toEqual(mediaId));
    service.setActualPlayingId('audio_2');
  });
});
