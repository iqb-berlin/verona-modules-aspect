import { LikertRowElement } from 'common/models/elements/compound-group-elements/likert/likert-row';
import { LikertRowLabelPipe } from 'editor/src/app/components/properties-panel/pipes/likert-row-label.pipe';

describe('LikertRowLabelPipe', () => {
  const pipe = new LikertRowLabelPipe();

  const createRow = (text: string, alias: string): LikertRowElement => ({
    alias,
    rowLabel: {
      text,
      imgSrc: null,
      imgFileName: '',
      imgPosition: 'above'
    }
  } as LikertRowElement);

  it('should map rows to their row labels enriched with the row alias', () => {
    const rows = [createRow('Zeile 1', 'row-1'), createRow('Zeile 2', 'row-2')];

    expect(pipe.transform(rows)).toEqual([
      {
        text: 'Zeile 1', imgSrc: null, imgFileName: '', imgPosition: 'above', alias: 'row-1'
      },
      {
        text: 'Zeile 2', imgSrc: null, imgFileName: '', imgPosition: 'above', alias: 'row-2'
      }
    ]);
  });

  it('should not modify the original row label', () => {
    const row = createRow('Zeile 1', 'row-1');
    pipe.transform([row]);
    expect(row.rowLabel).toEqual({
      text: 'Zeile 1', imgSrc: null, imgFileName: '', imgPosition: 'above'
    });
  });

  it('should return an empty array for no rows', () => {
    expect(pipe.transform([])).toEqual([]);
  });
});
