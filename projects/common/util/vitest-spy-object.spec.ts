import { createSpyObj } from './vitest-spy-object';

interface DemoService {
  greet(name: string): string;
  reset(): void;
}

describe('createSpyObj', () => {
  it('should create mock functions for all listed methods', () => {
    const spyObj = createSpyObj<DemoService>(['greet', 'reset']);

    spyObj.greet('world');

    expect(spyObj.greet).toHaveBeenCalledWith('world');
    expect(spyObj.reset).not.toHaveBeenCalled();
  });

  it('should allow configuring return values per method', () => {
    const spyObj = createSpyObj<DemoService>(['greet', 'reset']);
    spyObj.greet.mockReturnValue('hello');

    expect(spyObj.greet('x')).toBe('hello');
  });
});
