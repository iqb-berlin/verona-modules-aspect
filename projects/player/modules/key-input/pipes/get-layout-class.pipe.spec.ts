import { GetLayoutClassPipe } from './get-layout-class.pipe';

describe('getLayoutClass', () => {
  let pipe: GetLayoutClassPipe;

  beforeEach(() => {
    pipe = new GetLayoutClassPipe();
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });
});
