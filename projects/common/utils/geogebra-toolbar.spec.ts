import { GeoGebraToolbar } from 'common/utils/geogebra-toolbar';

/** GeoGebra 5.0.791's default toolbar, as `getPerspectiveXML()` hands it out for a file without one of
 * its own: the tool "Bild" sits in the menu of the slider. */
const defaultToolbar = '0 73 62 | 1 501 67 , 5 19 , 72 75 76 | 2 15 45 , 18 65 , 7 37 | 4 3 8 9 , 13 44 , 58 , 47 | ' +
  '16 51 64 , 70 | 10 34 53 11 , 24  20 22 , 21 23 | 55 56 57 , 12 | 36 46 , 38 49  50 , 71  14  68 | ' +
  '30 29 54 32 31 33 | 25 17 26 60 52 61 | 40 41 42 , 27 28 35 , 6';

describe('GeoGebraToolbar (#1700)', () => {
  describe('telling whether the tool "Bild" is offered', () => {
    it('should find it in the default toolbar and as a button of its own', () => {
      expect(GeoGebraToolbar.hasImageTool(defaultToolbar)).toBe(true);
      expect(GeoGebraToolbar.hasImageTool('0 | 26')).toBe(true);
      expect(GeoGebraToolbar.hasImageTool('0|26,1')).toBe(true);
    });

    it('should not take a tool whose number holds 26 for it', () => {
      expect(GeoGebraToolbar.hasImageTool('0 | 126 | 260')).toBe(false);
    });

    it('should find nothing in an empty toolbar or a mixed selection', () => {
      expect(GeoGebraToolbar.hasImageTool('')).toBe(false);
      expect(GeoGebraToolbar.hasImageTool(null)).toBe(false);
    });
  });

  describe('the toolbar without the tool "Bild"', () => {
    it('should keep the rest of the menu it was in', () => {
      expect(GeoGebraToolbar.withoutImageTool(defaultToolbar)).toContain('| 25 17 60 52 61 |');
      expect(GeoGebraToolbar.hasImageTool(GeoGebraToolbar.withoutImageTool(defaultToolbar))).toBe(false);
    });

    it('should drop a button or section that held nothing else', () => {
      expect(GeoGebraToolbar.withoutImageTool('0 | 26 | 1')).toBe('0 | 1');
      expect(GeoGebraToolbar.withoutImageTool('0 | 2 , 26 , 3')).toBe('0 | 2 , 3');
    });

    it('should leave tools whose number holds 26', () => {
      expect(GeoGebraToolbar.withoutImageTool('0 | 126 260')).toBe('0 | 126 260');
    });

    /* An empty toolbar is GeoGebra's default one, which offers the tool again. */
    it('should become the move tool when nothing else is left', () => {
      expect(GeoGebraToolbar.withoutImageTool('26')).toBe('0');
    });
  });

  it('should read the toolbar from an applet\'s perspective', () => {
    expect(GeoGebraToolbar.itemsOf('<perspective id="tmp"><toolbar show="true" items="0 | 26" position="1"/>'))
      .toBe('0 | 26');
    expect(GeoGebraToolbar.itemsOf('<perspective id="tmp"></perspective>')).toBeUndefined();
  });
});
