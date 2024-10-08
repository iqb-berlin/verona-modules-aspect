import { TestBed } from '@angular/core/testing';

import { ClickableService } from './clickable.service';

describe('ClickableService', () => {
  let service: ClickableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClickableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
