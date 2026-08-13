import { HasAnyPropertyPipe } from './has-any-property.pipe';

describe('HasAnyPropertyPipe', () => {
  const pipe = new HasAnyPropertyPipe();

  it('should report a group that holds a property', () => {
    expect(pipe.transform({ backgroundColor: 'red' })).toBe(true);
  });

  /* The case the pipe exists for: an element that declares no styling has an empty group, and an
     empty object is truthy -- the tab used to appear with nothing in it (#1226). */
  it('should report an empty group as holding nothing', () => {
    expect(pipe.transform({})).toBe(false);
  });

  it('should report a missing group as holding nothing', () => {
    expect(pipe.transform(undefined)).toBe(false);
    expect(pipe.transform(null)).toBe(false);
  });

  /* A property whose value is undefined still counts: the panel's own fields are gated on
     `!== undefined` one by one, and a group carrying the key belongs to an element that has it. */
  it('should count a property that is present but undefined', () => {
    expect(pipe.transform({ backgroundColor: undefined })).toBe(true);
  });
});
