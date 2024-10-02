import { TestBed } from '@angular/core/testing';

import { MarkClickableService } from './mark-clickable.service';

describe('MarkClickableService', () => {
  let service: MarkClickableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarkClickableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
