import { TestBed } from '@angular/core/testing';

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
});
