import { CastPipe } from './cast.pipe';

interface Animal { name: string }
interface Dog extends Animal { breed: string }

describe('CastPipe', () => {
  let pipe: CastPipe;

  beforeEach(() => {
    pipe = new CastPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return the very same object reference', () => {
    const dog: Dog = { name: 'Rex', breed: 'collie' };

    expect(pipe.transform<Animal, Dog>(dog, dog)).toBe(dog);
  });

  it('should pass through primitive values unchanged', () => {
    expect(pipe.transform<string, string>('value', 'value')).toBe('value');
    expect(pipe.transform<number, number>(0, 0)).toBe(0);
  });
});
