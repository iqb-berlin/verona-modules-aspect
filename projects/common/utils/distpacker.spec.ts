// 'fflate/browser', not 'fflate': the bare specifier resolves to the Node ESM build under
// Vitest browser mode and crashes at import time on createRequire.
import { zipSync } from 'fflate/browser';
import { Distpacker } from 'common/utils/distpacker';

const encode = (text: string): Uint8Array => new TextEncoder().encode(text);

const fileMapOf = (files: Record<string, string>): Map<string, Uint8Array> => new Map(
  Object.entries(files).map(([path, content]) => [path, encode(content)])
);

describe('Distpacker.findEntryHtml', () => {
  it('should follow the meta refresh of the root index.html', () => {
    const fileMap = fileMapOf({
      'index.html': '<META http-equiv="refresh" content="0;URL=tetfolio.fu-berlin.de/web/2477785.html">',
      'tetfolio.fu-berlin.de/web/2477785.html': '<html></html>',
      'tetfolio.fu-berlin.de/web/999.html': '<html></html>'
    });
    expect(Distpacker.findEntryHtml(fileMap)).toBe('tetfolio.fu-berlin.de/web/2477785.html');
  });

  it('should prefer a tetfolio web page when there is no root redirect', () => {
    const fileMap = fileMapOf({
      'tetfolio.fu-berlin.de/web/123.html': '<html></html>',
      'other/readme.html': '<html></html>'
    });
    expect(Distpacker.findEntryHtml(fileMap)).toBe('tetfolio.fu-berlin.de/web/123.html');
  });

  it('should skip pages that are embedded by another page via iframe', () => {
    const fileMap = fileMapOf({
      'tetfolio.fu-berlin.de/web/1.html': '<iframe src="2.html"></iframe>',
      'tetfolio.fu-berlin.de/web/2.html': '<html></html>'
    });
    expect(Distpacker.findEntryHtml(fileMap)).toBe('tetfolio.fu-berlin.de/web/1.html');
  });

  it('should fall back to any html file that is not the root index', () => {
    const fileMap = fileMapOf({
      'index.html': '<html>no redirect</html>',
      'unit/page.html': '<html></html>'
    });
    expect(Distpacker.findEntryHtml(fileMap)).toBe('unit/page.html');
  });

  it('should return null for a map without html files', () => {
    expect(Distpacker.findEntryHtml(fileMapOf({ 'style.css': 'body {}' }))).toBeNull();
  });
});

describe('Distpacker.pack', () => {
  it('should return null when no entry point exists', () => {
    expect(Distpacker.pack(fileMapOf({}))).toBeNull();
  });

  it('should inline a stylesheet link as a style tag', () => {
    const fileMap = fileMapOf({
      'web/1.html': '<html><head><link rel="stylesheet" href="style.css"></head><body></body></html>',
      'web/style.css': 'body { color: red; }'
    });
    const result = Distpacker.pack(fileMap, 'web/1.html');
    expect(result).toContain('<style>body { color: red; }</style>');
    expect(result).not.toContain('<link rel="stylesheet"');
  });

  it('should inline a stylesheet link whose href comes before its rel', () => {
    const fileMap = fileMapOf({
      'web/1.html': '<html><head><link href="style.css" rel="stylesheet"></head><body></body></html>',
      'web/style.css': 'body { color: red; }'
    });
    const result = Distpacker.pack(fileMap, 'web/1.html');
    expect(result).toContain('<style>body { color: red; }</style>');
    expect(result).not.toContain('href="style.css"');
  });

  it('should leave a link that is not a stylesheet alone', () => {
    const html = '<html><head><link rel="preload" href="style.css"></head><body></body></html>';
    const fileMap = fileMapOf({ 'web/1.html': html, 'web/style.css': 'body { color: red; }' });
    expect(Distpacker.pack(fileMap, 'web/1.html')).toBe(html);
  });

  it('should inline a script tag with the referenced file content', () => {
    const fileMap = fileMapOf({
      'web/1.html': '<html><body><script src="app.js"></script></body></html>',
      'web/app.js': 'console.log(1);'
    });
    const result = Distpacker.pack(fileMap, 'web/1.html');
    expect(result).toContain('console.log(1);');
    expect(result).not.toContain('src="app.js"');
  });

  it('should keep a closing script tag inside an inlined script from ending it', () => {
    const fileMap = fileMapOf({
      'web/1.html': '<html><body><script src="app.js"></script></body></html>',
      'web/app.js': 'var tag = "</script>"; var upper = "</SCRIPT>";'
    });
    const result = Distpacker.pack(fileMap, 'web/1.html') as string;
    expect(result).toContain('var tag = "<\\/script>"; var upper = "<\\/SCRIPT>";');
    const doc = new DOMParser().parseFromString(result, 'text/html');
    expect(doc.scripts).toHaveLength(1);
    expect(doc.scripts[0].textContent).toContain('var upper');
  });

  it('should inline a favicon link', () => {
    const fileMap = fileMapOf({
      'web/1.html': '<html><head><link rel="shortcut icon" href="../favicon.ico"/></head><body></body></html>',
      'favicon.ico': 'ICO'
    });
    expect(Distpacker.pack(fileMap, 'web/1.html'))
      .toContain(`<link type="image/x-icon" href="data:image/x-icon;base64,${btoa('ICO')}" />`);
  });

  it('should replace only the favicon tag when other tags share its line', () => {
    const fileMap = fileMapOf({
      'web/1.html': '<html><head><link rel="stylesheet" href="style.css"><script src="app.js"></script>' +
        '<link rel="icon" href="favicon.ico"></head><body></body></html>',
      'web/style.css': 'body { color: red; }',
      'web/app.js': 'console.log(1);',
      'web/favicon.ico': 'ICO'
    });
    const result = Distpacker.pack(fileMap, 'web/1.html');
    expect(result).toContain('<style>body { color: red; }</style>');
    expect(result).toContain('console.log(1);');
    expect(result).toContain(`data:image/x-icon;base64,${btoa('ICO')}`);
  });

  it('should inline an image as a base64 data URI', () => {
    const fileMap = fileMapOf({
      'web/1.html': '<html><body><img src="images/dot.png"></body></html>',
      'web/images/dot.png': 'PNGDATA'
    });
    const result = Distpacker.pack(fileMap, 'web/1.html');
    expect(result).toContain(`src="data:image/png;base64,${btoa('PNGDATA')}"`);
  });

  it('should inline a nested iframe page via srcdoc', () => {
    const fileMap = fileMapOf({
      'web/1.html': '<html><body><iframe src="2.html"></iframe></body></html>',
      'web/2.html': '<p>inner</p>'
    });
    const result = Distpacker.pack(fileMap, 'web/1.html');
    expect(result).toContain('srcdoc="<p>inner</p>"');
  });

  it('should inline the same page into every sibling iframe that references it', () => {
    const fileMap = fileMapOf({
      'web/1.html': '<html><body><iframe src="2.html"></iframe><iframe src="2.html"></iframe></body></html>',
      'web/2.html': '<p>inner</p>'
    });
    const result = Distpacker.pack(fileMap, 'web/1.html') as string;
    expect(result.match(/srcdoc="<p>inner<\/p>"/g)).toHaveLength(2);
    expect(result).not.toContain('src="2.html"');
  });

  it('should stop a circular iframe reference instead of recursing forever', () => {
    const fileMap = fileMapOf({
      'web/1.html': '<html><body><iframe src="2.html"></iframe></body></html>',
      'web/2.html': '<p>inner</p><iframe src="1.html"></iframe>'
    });
    const result = Distpacker.pack(fileMap, 'web/1.html') as string;
    expect(result).toContain('inner');
    // The cycle back to the entry stays a plain src reference.
    expect(result).toContain('1.html');
  });

  it('should inline an m4a audio reference with the audio/mp4 MIME type', () => {
    const fileMap = fileMapOf({
      'web/1.html': "<html><body><script>var a = 'sounds/beep.m4a';</script></body></html>",
      'web/sounds/beep.m4a': 'M4ADATA'
    });
    const result = Distpacker.pack(fileMap, 'web/1.html');
    expect(result).toContain(`'data:audio/mp4;base64,${btoa('M4ADATA')}'`);
  });

  it('should leave external references untouched', () => {
    const html = '<html><body><script src="https://example.org/x.js"></script>' +
      '<img src="https://example.org/x.png"></body></html>';
    const fileMap = fileMapOf({ 'web/1.html': html });
    const result = Distpacker.pack(fileMap, 'web/1.html');
    expect(result).toContain('https://example.org/x.js');
    expect(result).toContain('https://example.org/x.png');
  });
});

describe('Distpacker.packZip', () => {
  const zipOf = (files: Record<string, string>): Uint8Array => zipSync(
    Object.fromEntries(Object.entries(files).map(([path, content]) => [path, encode(content)]))
  );

  it('should unzip an export and pack its entry page', async () => {
    const html = await Distpacker.packZip(zipOf({
      'tetfolio.fu-berlin.de/web/123.html': '<html><body><img src="dot.png"></body></html>',
      'tetfolio.fu-berlin.de/web/dot.png': 'PNGDATA'
    }));
    expect(html).toBe(`<html><body><img src="data:image/png;base64,${btoa('PNGDATA')}"></body></html>`);
  });

  it('should return null for a zip without an html page', async () => {
    expect(await Distpacker.packZip(zipOf({ 'readme.txt': 'no html here' }))).toBeNull();
  });

  it('should throw for data that is not a zip', async () => {
    await expect(Distpacker.packZip(encode('not a zip'))).rejects.toThrow();
  });
});
