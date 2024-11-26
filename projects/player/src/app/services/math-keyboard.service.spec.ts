import { TestBed } from '@angular/core/testing';

import { MathKeyboardService } from './math-keyboard.service';

describe('MathKeyboardService', () => {
  let service: MathKeyboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MathKeyboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
