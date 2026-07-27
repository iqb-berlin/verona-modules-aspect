import { TestBed } from '@angular/core/testing';
import { MarkingPanelMarkingData } from 'common/models/marking-data';
import { MarkingColorData, MarkingRangeData } from 'player/src/app/models/markable.interface';
import { MarkingPanelService } from './marking-panel.service';

describe('MarkingPanelService', () => {
  let service: MarkingPanelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarkingPanelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should broadcast marking data', () => {
    const received: MarkingPanelMarkingData[] = [];
    service.markingPanelMarkingDataChanged.subscribe(data => received.push(data));
    const markingData = { elementId: 'text_1', mode: 'mark' } as unknown as MarkingPanelMarkingData;

    service.broadcastMarkingData(markingData);

    expect(received).toEqual([markingData]);
  });

  it('should broadcast a marking color', () => {
    const received: MarkingColorData[] = [];
    service.markingColorChanged.subscribe(data => received.push(data));
    const colorData = { color: 'yellow' } as unknown as MarkingColorData;

    service.broadcastMarkingColorData(colorData);

    expect(received).toEqual([colorData]);
  });

  it('should broadcast range clicks', () => {
    const received: MarkingRangeData[] = [];
    service.markingRangeChanged.subscribe(data => received.push(data));
    const rangeData = { elementId: 'text_1' } as unknown as MarkingRangeData;

    service.broadcastRangeClicks(rangeData);

    expect(received).toEqual([rangeData]);
  });
});
