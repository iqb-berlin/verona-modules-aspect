import { WordCounter } from './word-counter';

describe('WordCounter', () => {
  it('should count nothing in an empty text or in whitespace alone', () => {
    expect(WordCounter.count('')).toBe(0);
    expect(WordCounter.count('   \n\t ')).toBe(0);
  });

  it('should count the pieces between spaces', () => {
    expect(WordCounter.count('Das ist ein Satz')).toBe(4);
  });

  it('should separate at line breaks and tabs as well, and at runs of whitespace', () => {
    expect(WordCounter.count('eins\nzwei\tdrei   vier\r\nfünf')).toBe(5);
  });

  it('should ignore whitespace at the start and at the end', () => {
    expect(WordCounter.count('  eins zwei  ')).toBe(2);
  });

  it('should not count punctuation that stands on its own', () => {
    expect(WordCounter.count('Hallo , Welt ! – " ? .')).toBe(2);
  });

  it('should not split a word at attached punctuation, an apostrophe or a hyphen', () => {
    expect(WordCounter.count('„Geht\'s?“, fragte die Ost-West-Verbindung z.B.')).toBe(5);
  });

  it('should count numbers and letters outside ASCII', () => {
    expect(WordCounter.count('3 Äpfel für 1,50 €')).toBe(4);
  });
});
