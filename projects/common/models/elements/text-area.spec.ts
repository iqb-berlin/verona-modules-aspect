import { TextAreaElement } from 'common/models/elements/text-area';

describe('TextAreaElement', () => {
  it.each([true, false])('should keep a stored showWordCount %s', showWordCount => {
    const element = new TextAreaElement({
      id: 'text-area_1',
      type: 'text-area',
      rowCount: 3,
      showWordCount
    });

    expect(element.showWordCount).toBe(showWordCount);
  });
});
