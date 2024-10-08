import { TestBed } from '@angular/core/testing';

import { MarkableService } from './markable.service';

describe('MarkableService', () => {
  let service: MarkableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarkableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
