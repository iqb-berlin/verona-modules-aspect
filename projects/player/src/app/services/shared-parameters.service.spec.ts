import { TestBed } from '@angular/core/testing';
import { SharedParameter } from 'player/modules/verona/models/verona';
import { SharedParametersService } from './shared-parameters.service';

describe('SharedParametersService', () => {
  let service: SharedParametersService;

  beforeEach(() => {
    service = TestBed.inject(SharedParametersService);
  });

  it('should hand a share to its subscribers at once', () => {
    const received: SharedParameter[][] = [];
    service.shared.subscribe(parameters => received.push(parameters));

    service.share([{ key: 'BONDING_TYPE', value: 'VALENCE' }]);

    expect(received).toEqual([[{ key: 'BONDING_TYPE', value: 'VALENCE' }]]);
  });

  it('should not replay an earlier share to a later subscriber', () => {
    service.share([{ key: 'BONDING_TYPE', value: 'VALENCE' }]);
    const received: SharedParameter[][] = [];

    service.shared.subscribe(parameters => received.push(parameters));

    expect(received).toEqual([]);
  });
});
