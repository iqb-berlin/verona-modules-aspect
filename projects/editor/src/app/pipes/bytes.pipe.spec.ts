import { BytesPipe } from 'editor/src/app/pipes/bytes.pipe';

describe('BytesPipe', () => {
  const pipe = new BytesPipe();

  it('should return "0 B" for zero bytes', () => {
    expect(pipe.transform(0)).toBe('0 B');
  });

  it('should keep values below 1024 in bytes', () => {
    expect(pipe.transform(500)).toBe('500 B');
  });

  it('should convert to kilobytes', () => {
    expect(pipe.transform(1024)).toBe('1 KB');
    expect(pipe.transform(1536)).toBe('1.5 KB');
  });

  it('should convert to megabytes', () => {
    expect(pipe.transform(1048576)).toBe('1 MB');
  });

  it('should round to two decimal places', () => {
    expect(pipe.transform(1234567)).toBe('1.18 MB');
  });

  it('should convert to gigabytes', () => {
    expect(pipe.transform(2 * 1024 * 1024 * 1024)).toBe('2 GB');
  });
});
