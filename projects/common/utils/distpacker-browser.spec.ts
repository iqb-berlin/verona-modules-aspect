import { distpack, findEntryHtml } from 'common/utils/distpacker-browser';

const encode = (text: string): Uint8Array => new TextEncoder().encode(text);

const fileMapOf = (files: Record<string, string>): Map<string, Uint8Array> => new Map(
  Object.entries(files).map(([path, content]) => [path, encode(content)])
);

describe('findEntryHtml', () => {
  it('should follow the meta refresh of the root index.html', () => {
    const fileMap = fileMapOf({
      'index.html': '<META http-equiv="refresh" content="0;URL=tetfolio.fu-berlin.de/web/2477785.html">',
      'tetfolio.fu-berlin.de/web/2477785.html': '<html></html>',
      'tetfolio.fu-berlin.de/web/999.html': '<html></html>'
    });
    expect(findEntryHtml(fileMap)).toBe('tetfolio.fu-berlin.de/web/2477785.html');
  });

  it('should prefer a tetfolio web page when there is no root redirect', () => {
    const fileMap = fileMapOf({
      'tetfolio.fu-berlin.de/web/123.html': '<html></html>',
      'other/readme.html': '<html></html>'
    });
    expect(findEntryHtml(fileMap)).toBe('tetfolio.fu-berlin.de/web/123.html');
  });

  it('should skip pages that are embedded by another page via iframe', () => {
    const fileMap = fileMapOf({
      'tetfolio.fu-berlin.de/web/1.html': '<iframe src="2.html"></iframe>',
      'tetfolio.fu-berlin.de/web/2.html': '<html></html>'
    });
    expect(findEntryHtml(fileMap)).toBe('tetfolio.fu-berlin.de/web/1.html');
  });

  it('should fall back to any html file that is not the root index', () => {
    const fileMap = fileMapOf({
      'index.html': '<html>no redirect</html>',
      'unit/page.html': '<html></html>'
    });
    expect(findEntryHtml(fileMap)).toBe('unit/page.html');
  });

  it('should return null for a map without html files', () => {
    expect(findEntryHtml(fileMapOf({ 'style.css': 'body {}' }))).toBeNull();
  });
});

describe('distpack', () => {
  it('should return null when no entry point exists', () => {
    expect(distpack(fileMapOf({}))).toBeNull();
  });

  it('should inline a stylesheet link as a style tag', () => {
    const fileMap = fileMapOf({
      'web/1.html': '<html><head><link rel="stylesheet" href="style.css"></head><body></body></html>',
      'web/style.css': 'body { color: red; }'
    });
    const result = distpack(fileMap, 'web/1.html');
    expect(result).toContain('<style>body { color: red; }</style>');
    expect(result).not.toContain('<link rel="stylesheet"');
  });

  it('should inline a script tag with the referenced file content', () => {
    const fileMap = fileMapOf({
      'web/1.html': '<html><body><script src="app.js"></script></body></html>',
      'web/app.js': 'console.log(1);'
    });
    const result = distpack(fileMap, 'web/1.html');
    expect(result).toContain('console.log(1);');
    expect(result).not.toContain('src="app.js"');
  });

  it('should inline an image as a base64 data URI', () => {
    const fileMap = fileMapOf({
      'web/1.html': '<html><body><img src="images/dot.png"></body></html>',
      'web/images/dot.png': 'PNGDATA'
    });
    const result = distpack(fileMap, 'web/1.html');
    expect(result).toContain(`src="data:image/png;base64,${btoa('PNGDATA')}"`);
  });

  it('should inline a nested iframe page via srcdoc', () => {
    const fileMap = fileMapOf({
      'web/1.html': '<html><body><iframe src="2.html"></iframe></body></html>',
      'web/2.html': '<p>inner</p>'
    });
    const result = distpack(fileMap, 'web/1.html');
    expect(result).toContain('srcdoc="<p>inner</p>"');
  });

  it('should leave external references untouched', () => {
    const html = '<html><body><script src="https://example.org/x.js"></script>' +
      '<img src="https://example.org/x.png"></body></html>';
    const fileMap = fileMapOf({ 'web/1.html': html });
    const result = distpack(fileMap, 'web/1.html');
    expect(result).toContain('https://example.org/x.js');
    expect(result).toContain('https://example.org/x.png');
  });
});
