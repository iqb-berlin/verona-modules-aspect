import { GetAlternativeKeyPipe } from './get-alternative-key.pipe';

describe('getAlternativeKey', () => {
  let pipe: GetAlternativeKeyPipe;

  beforeEach(() => {
    pipe = new GetAlternativeKeyPipe();
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform values to null', () => {
    const key = 'a';
    const shiftedKey = 'A';
    expect(pipe.transform(key, shiftedKey, true)).toEqual(null);
  });

  it('should transform values to 1', () => {
    const key = '1';
    const shiftedKey = '!';
    expect(pipe.transform(key, shiftedKey, true)).toEqual('1');
  });

  it('should transform values to !', () => {
    const key = '1';
    const shiftedKey = '!';
    expect(pipe.transform(key, shiftedKey, false)).toEqual('!');
  });
});
