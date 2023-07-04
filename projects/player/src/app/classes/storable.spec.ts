import { Storable } from './storable';

describe('Storable', () => {
  it('should create an instance', () => {
    expect(new Storable('test', 1)).toBeTruthy();
  });
});
