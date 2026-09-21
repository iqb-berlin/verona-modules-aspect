import {
  extractTetfolioStateKeys, injectTetfolioBridge, TETFOLIO_STATE_KEY_PREFIX
} from 'common/utils/tetfolio-bridge';

describe('extractTetfolioStateKeys', () => {
  it('should derive the state key from the tetfoliopage attribute', () => {
    const html = '<div tetfoliopage="tf_1651734"></div>';
    expect(extractTetfolioStateKeys(html)).toEqual([`${TETFOLIO_STATE_KEY_PREFIX}1651734`]);
  });

  it('should accept single quotes and deduplicate repeated pages', () => {
    const html = "<div tetfoliopage='tf_42'></div><span tetfoliopage=\"tf_42\"></span>";
    expect(extractTetfolioStateKeys(html)).toEqual([`${TETFOLIO_STATE_KEY_PREFIX}42`]);
  });

  it('should collect the keys of several pages', () => {
    const html = '<div tetfoliopage="tf_1"></div><div tetfoliopage="tf_2"></div>';
    expect(extractTetfolioStateKeys(html)).toEqual([
      `${TETFOLIO_STATE_KEY_PREFIX}1`, `${TETFOLIO_STATE_KEY_PREFIX}2`
    ]);
  });

  it('should ignore attribute values without a page id after the marker', () => {
    expect(extractTetfolioStateKeys('<div tetfoliopage="tf_"></div>')).toEqual([]);
  });

  it('should return no keys for HTML without the attribute', () => {
    expect(extractTetfolioStateKeys('<html><body></body></html>')).toEqual([]);
  });
});

describe('injectTetfolioBridge', () => {
  it('should splice the bridge script before the closing body tag', () => {
    const result = injectTetfolioBridge('<html><body><p>x</p></body></html>', null);
    const scriptIndex = result.indexOf('<script>');
    const bodyCloseIndex = result.indexOf('</body>');
    expect(scriptIndex).toBeGreaterThan(-1);
    expect(scriptIndex).toBeLessThan(bodyCloseIndex);
  });

  it('should append the bridge script when there is no body tag', () => {
    const result = injectTetfolioBridge('<p>x</p>', null);
    expect(result.startsWith('<p>x</p>')).toBe(true);
    expect(result).toContain('<script>');
  });

  it('should scope the script to the state keys found in the HTML', () => {
    const html = '<html><body><div tetfoliopage="tf_77"></div></body></html>';
    const result = injectTetfolioBridge(html, null);
    expect(result).toContain(`"${TETFOLIO_STATE_KEY_PREFIX}77"`);
  });

  it('should embed the saved state for seeding when one is given', () => {
    const savedState = JSON.stringify({ [`${TETFOLIO_STATE_KEY_PREFIX}77`]: 'line1' });
    const result = injectTetfolioBridge('<html><body></body></html>', savedState);
    expect(result).toContain(JSON.stringify(savedState));
  });

  it('should not contain a seeding block without a saved state', () => {
    const result = injectTetfolioBridge('<html><body></body></html>', null);
    expect(result).not.toContain('seededState');
  });
});
