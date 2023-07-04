import { StorableTimer } from './storable-timer';

describe('StorableTimer', () => {
  it('should create an instance', () => {
    expect(new StorableTimer('test', 0, 3000)).toBeTruthy();
  });
});
