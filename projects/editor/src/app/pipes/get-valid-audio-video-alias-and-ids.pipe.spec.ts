import { UnitService } from 'editor/src/app/services/unit.service';
import {
  GetValidAudioVideoAliasAndIDsPipe
} from 'editor/src/app/pipes/get-valid-audio-video-alias-and-ids.pipe';

describe('GetValidAudioVideoAliasAndIDsPipe', () => {
  let pipe: GetValidAudioVideoAliasAndIDsPipe;

  const audio1 = { id: 'audio_1', alias: 'Audio-1' };
  const audio2 = { id: 'audio_2', alias: 'Audio-2' };
  const video1 = { id: 'video_1', alias: 'Video-1' };

  beforeEach(() => {
    const unitServiceMock = {
      unit: {
        getAllElements: vi.fn((elementType: string) => (
          elementType === 'audio' ? [audio1, audio2] : [video1]))
      }
    };
    pipe = new GetValidAudioVideoAliasAndIDsPipe(unitServiceMock as unknown as UnitService);
  });

  it('should list all audio and video elements of the unit', () => {
    expect(pipe.transform('')).toEqual([
      { id: 'audio_1', alias: 'Audio-1' },
      { id: 'audio_2', alias: 'Audio-2' },
      { id: 'video_1', alias: 'Video-1' }
    ]);
  });

  it('should filter out the element with the ignored ID', () => {
    expect(pipe.transform('audio_1')).toEqual([
      { id: 'audio_2', alias: 'Audio-2' },
      { id: 'video_1', alias: 'Video-1' }
    ]);
  });

  it('should also filter out video elements by ignored ID', () => {
    const result = pipe.transform('video_1');
    expect(result.map(pair => pair.id)).toEqual(['audio_1', 'audio_2']);
  });
});
