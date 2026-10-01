/**
 * Packs a tet.folio export into one self-contained HTML document: every stylesheet, script,
 * image, audio file and nested page the entry page references is inlined, so the result can be
 * stored as a single string in the unit definition and rendered via `srcdoc`.
 *
 * Zip structure of a tet.folio export:
 *   index.html                                   <- redirect page, names the entry
 *   tetfolio.fu-berlin.de/web/<number>.html      <- entry point
 *   tetfolio.fu-berlin.de/web/<number>.html      <- nested experiment page, loaded in an iframe
 *   tetfolio.fu-berlin.de/static/..., inc/...    <- scripts, styles, media
 *
 * Works on an in-memory file map instead of the filesystem. Based on tetfolio-distpacker.js by
 * Andreas Fleck and Richard Henck.
 */
export class Distpacker {
  private static readonly DEBUG = false;

  private static readonly MIME_TYPES: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    webp: 'image/webp',
    bmp: 'image/bmp',
    ico: 'image/x-icon',
    mp3: 'audio/mpeg',
    ogg: 'audio/ogg',
    wav: 'audio/wav',
    m4a: 'audio/mp4',
    aac: 'audio/aac',
    mp4: 'video/mp4',
    webm: 'video/webm',
    woff: 'font/woff',
    woff2: 'font/woff2',
    ttf: 'font/ttf',
    eot: 'application/vnd.ms-fontobject'
  };

  /** Media extensions whose paths are inlined where they appear as quoted string literals. */
  private static readonly MEDIA_LITERAL_EXTENSIONS = [
    'mp3', 'ogg', 'wav', 'm4a', 'aac',
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'
  ];

  /**
   * Unzips a tet.folio export and packs it. Returns null when the zip holds no HTML entry page;
   * a zip that cannot be read throws.
   */
  static async packZip(zip: Uint8Array): Promise<string | null> {
    // 'fflate/browser', not 'fflate': the bare specifier resolves to the Node ESM build under
    // Vitest browser mode and crashes at import time on createRequire.
    const { unzipSync } = await import('fflate/browser');
    return Distpacker.pack(new Map(Object.entries(unzipSync(zip))));
  }

  /**
   * Packs the entry page of an in-memory file map, given explicitly or found by `findEntryHtml`.
   * Returns null when there is no entry page.
   */
  static pack(fileMap: Map<string, Uint8Array>, entryHtmlPath?: string): string | null {
    const entry = entryHtmlPath || Distpacker.findEntryHtml(fileMap);
    if (!entry) return null;
    Distpacker.logDebug(`Entry HTML: ${entry}`);
    return Distpacker.packHtmlFile(entry, fileMap, new Set<string>());
  }

  /**
   * Find the main HTML entry point in the zip file map.
   * 0. The meta refresh of the shallowest index.html, which names the real entry.
   * 1. tetfolio.fu-berlin.de/web/<digits>.html that no other page embeds via iframe
   * 2. any .html in a /web/ directory, same filter
   * 3. any .html that is not a root-level index.html
   */
  static findEntryHtml(fileMap: Map<string, Uint8Array>): string | null {
    const keys = [...fileMap.keys()];

    // Exports can contain several HTML files in web/ (the entry page plus inner iframe pages),
    // so the redirect is the best source of truth. Shallowest match first: exports may wrap
    // everything in a folder, but a nested index.html (e.g. IMPAL/<n>/index.html) must never
    // win over the actual root redirect page.
    const rootIndex = keys
      .filter(k => /(^|\/)index\.html$/i.test(k))
      .sort((a, b) => a.split('/').length - b.split('/').length)[0];
    if (rootIndex) {
      const indexHtml = Distpacker.readText(rootIndex, fileMap);
      const redirect = indexHtml.match(/http-equiv=["']refresh["'][^>]*content=["'][^"']*URL=([^"'>]+)["']/i);
      if (redirect) {
        const target = Distpacker.resolveAsset(Distpacker.dirname(rootIndex), redirect[1].trim(), fileMap);
        if (target) return target;
      }
    }

    // Without a redirect, the entry is the HTML that no other HTML embeds via <iframe src>.
    const isNotIframeTarget = Distpacker.buildIframeTargetFilter(fileMap);

    const tetfolioCandidates = keys.filter(k => /tetfolio\.fu-berlin\.de\/web\/\d+\.html$/i.test(k));
    const tetfolioEntry = tetfolioCandidates.find(isNotIframeTarget) || tetfolioCandidates[0];
    if (tetfolioEntry) return tetfolioEntry;

    const webCandidates = keys.filter(k => /\/web\/[^/]+\.html$/i.test(k));
    const webEntry = webCandidates.find(isNotIframeTarget) || webCandidates[0];
    if (webEntry) return webEntry;

    const htmlFiles = keys
      .filter(k => k.endsWith('.html') && k !== 'index.html')
      .sort((a, b) => a.split('/').length - b.split('/').length);
    return htmlFiles.find(isNotIframeTarget) || htmlFiles[0] || null;
  }

  /** Run all replacement passes on one HTML file from the map. */
  private static packHtmlFile(htmlPath: string, fileMap: Map<string, Uint8Array>, visited: Set<string>): string {
    visited.add(htmlPath);
    const baseDir = Distpacker.dirname(htmlPath);
    let html = Distpacker.readText(htmlPath, fileMap);
    html = Distpacker.replaceFavicon(html, baseDir, fileMap);
    html = Distpacker.replaceCSSLinks(html, baseDir, fileMap);
    html = Distpacker.replaceScriptTags(html, baseDir, fileMap);
    html = Distpacker.replaceImages(html, baseDir, fileMap);
    html = Distpacker.replaceAudioFiles(html, baseDir, fileMap);
    html = Distpacker.replaceMediaStringLiterals(html, baseDir, fileMap);
    html = Distpacker.replaceIframes(html, baseDir, fileMap, visited);
    return html;
  }

  /** One `<link>` tag at a time: a pattern spanning tags would swallow everything in between. */
  private static replaceFavicon(html: string, baseDir: string, fileMap: Map<string, Uint8Array>): string {
    const regex = /<link\b[^>]*?\bhref=["']([^"']*\.ico)["'][^>]*>/gi;
    return html.replace(regex, (match, href) => {
      const assetPath = Distpacker.resolveAsset(baseDir, href, fileMap);
      if (!assetPath) return match;
      Distpacker.logDebug(`Replacing favicon: ${href}`);
      const b64 = Distpacker.base64Encode(assetPath, fileMap);
      return `<link type="image/x-icon" href="data:image/x-icon;base64,${b64}" />`;
    });
  }

  /** `rel` and `href` are looked up separately, so their order in the tag does not matter. */
  private static replaceCSSLinks(html: string, baseDir: string, fileMap: Map<string, Uint8Array>): string {
    return html.replace(/<link\b[^>]*>/gi, match => {
      if (!/\brel=["']stylesheet["']/i.test(match)) return match;
      const href = match.match(/\bhref=["']([^"']+)["']/i)?.[1];
      if (!href) return match;
      const cssPath = Distpacker.resolveAsset(baseDir, href, fileMap);
      if (!cssPath) {
        Distpacker.logDebug(`CSS file not found: ${href}`);
        return match;
      }
      Distpacker.logDebug(`Replacing CSS link: ${href}`);
      const cssString = Distpacker.replaceUrlInCss(
        Distpacker.readText(cssPath, fileMap), Distpacker.dirname(cssPath), fileMap
      );
      return `<style>${cssString}</style>`;
    });
  }

  /**
   * Inlines script files. A `</script` inside the file - in a string or a comment, the only places
   * it can stand in valid JavaScript - would end the inline script early, so it is written as
   * `<\/script`, which means the same to the script and nothing to the HTML parser.
   */
  private static replaceScriptTags(html: string, baseDir: string, fileMap: Map<string, Uint8Array>): string {
    const regex = /<script[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi;
    return html.replace(regex, (match, src) => {
      if (src.startsWith('http://') || src.startsWith('https://')) {
        Distpacker.logDebug(`Skipping external script: ${src}`);
        return match;
      }
      const scriptPath = Distpacker.resolveAsset(baseDir, src, fileMap);
      if (!scriptPath) {
        Distpacker.logDebug(`JS file not found: ${src}`);
        return match;
      }
      const content = Distpacker.readText(scriptPath, fileMap).replace(/<\/(script)/gi, '<\\/$1');
      Distpacker.logDebug(`Replacing script: ${src}`);
      return `<script type='text/javascript'>${content}\n</script>`;
    });
  }

  private static replaceImages(html: string, baseDir: string, fileMap: Map<string, Uint8Array>): string {
    const regex = /<img([^>]*src=["']([^"']+)["'][^>]*)>/gi;
    return html.replace(regex, (match, attributes, src) => {
      if (Distpacker.isExternal(src)) return match;
      const dataUri = Distpacker.toDataUri(baseDir, src, fileMap);
      if (!dataUri) {
        Distpacker.logDebug(`Image not found: ${src}`);
        return match;
      }
      Distpacker.logDebug(`Replacing image: ${src}`);
      return `<img${attributes.replace(/src=["'][^"']+["']/i, `src="${dataUri}"`)}>`;
    });
  }

  /** Replace audio references in `<audio>` and `<source>` tags. */
  private static replaceAudioFiles(html: string, baseDir: string, fileMap: Map<string, Uint8Array>): string {
    const regex = /<(?:audio|source)[^>]*src=["']([^"']+)["'][^>]*>/gi;
    return html.replace(regex, (match, src) => {
      if (Distpacker.isExternal(src)) return match;
      const dataUri = Distpacker.toDataUri(baseDir, src, fileMap);
      if (!dataUri) return match;
      Distpacker.logDebug(`Replacing audio: ${src}`);
      return match.replace(/src=["'][^"']+["']/i, `src="${dataUri}"`);
    });
  }

  /**
   * Replace media file paths that appear as quoted string literals - e.g. JS arrays of animation
   * frames in IMPAL apps (frames = ['images/hotzone-...-0.jpg', ...], preloaded at runtime) or
   * audio paths passed to Howler.js. Relative fetches cannot resolve from a srcdoc document, so
   * these must be inlined as data URIs.
   */
  private static replaceMediaStringLiterals(html: string, baseDir: string, fileMap: Map<string, Uint8Array>): string {
    const regex = new RegExp(
      `(['"])([^'"]*\\.(?:${Distpacker.MEDIA_LITERAL_EXTENSIONS.join('|')}))\\1`,
      'gi'
    );
    return html.replace(regex, (match, quote, filePath) => {
      if (Distpacker.isExternal(filePath)) return match;
      const dataUri = Distpacker.toDataUri(baseDir, filePath, fileMap);
      if (!dataUri) return match;
      Distpacker.logDebug(`Replacing media string literal: ${filePath}`);
      return `${quote}${dataUri}${quote}`;
    });
  }

  /**
   * Recursively inline nested iframe pages via srcdoc.
   *
   * Tet.folio exports embed the actual experiment as a second HTML file loaded in an
   * `<iframe src="1651734.html">` inside the entry page. The outer page accesses
   * `iframe.contentWindow` (e.g. `window.iiwin.jQuery`), so the inner document must stay
   * same-origin: srcdoc inherits the parent origin, while a data: URI would create an opaque
   * origin and break that access.
   */
  private static replaceIframes(
    html: string, baseDir: string, fileMap: Map<string, Uint8Array>, visited: Set<string>
  ): string {
    const regex = /<iframe([^>]*)src=["']([^"']+)["']([^>]*)>/gi;
    return html.replace(regex, (match, before, src, after) => {
      if (Distpacker.isExternal(src)) return match;
      const framePath = Distpacker.resolveAsset(baseDir, src, fileMap);
      if (!framePath) {
        Distpacker.logDebug(`Iframe page not found: ${src}`);
        return match;
      }
      if (visited.has(framePath)) {
        Distpacker.logDebug(`Iframe recursion detected, skipping: ${framePath}`);
        return match;
      }
      Distpacker.logDebug(`Inlining iframe: ${src}`);
      // A copy per branch: `visited` must block only true cycles (the ancestor chain), not two
      // SIBLING iframes referencing the same file - with a shared set the second sibling kept its
      // relative src, which cannot resolve from the packed document, and showed an empty frame.
      const packedFrame = Distpacker.packHtmlFile(framePath, fileMap, new Set(visited));
      return `<iframe${before}srcdoc="${Distpacker.escapeHtmlAttribute(packedFrame)}"${after}>`;
    });
  }

  private static replaceUrlInCss(cssString: string, cssDir: string, fileMap: Map<string, Uint8Array>): string {
    return cssString.replace(/\burl\([^)]+\)/gi, match => {
      const url = match.match(/url\(['"]?([^'"()]+)['"]?\)/i)?.[1];
      if (!url || Distpacker.isExternal(url)) return match;
      if (/[~#%*<>?{|}]/.test(url)) return match;
      const dataUri = Distpacker.toDataUri(cssDir, url, fileMap);
      if (!dataUri) {
        Distpacker.logDebug(`CSS url() not found: ${url}`);
        return match;
      }
      Distpacker.logDebug(`Replacing URL in CSS: ${url}`);
      return `url(${dataUri})`;
    });
  }

  /**
   * True for HTML files NOT referenced as an `<iframe src>` by any other HTML file in the map.
   * Iframe-referenced pages are inner experiment pages, never the entry.
   */
  private static buildIframeTargetFilter(fileMap: Map<string, Uint8Array>): (key: string) => boolean {
    const iframeTargets = new Set<string>();
    fileMap.forEach((_, filePath) => {
      if (!filePath.endsWith('.html')) return;
      const html = Distpacker.readText(filePath, fileMap);
      const baseDir = Distpacker.dirname(filePath);
      const regex = /<iframe[^>]*src=["']([^"']+)["']/gi;
      let match = regex.exec(html);
      while (match !== null) {
        const target = Distpacker.resolveAsset(baseDir, match[1], fileMap);
        if (target) iframeTargets.add(target);
        match = regex.exec(html);
      }
    });
    return (key: string) => !iframeTargets.has(key);
  }

  private static isExternal(path: string): boolean {
    return path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://');
  }

  /** The asset at `rawPath` as a base64 data URI, or null when the map does not hold it. */
  private static toDataUri(baseDir: string, rawPath: string, fileMap: Map<string, Uint8Array>): string | null {
    const assetPath = Distpacker.resolveAsset(baseDir, rawPath, fileMap);
    if (!assetPath) return null;
    const mime = Distpacker.MIME_TYPES[Distpacker.getExtension(assetPath).toLowerCase()] ||
      'application/octet-stream';
    return `data:${mime};base64,${Distpacker.base64Encode(assetPath, fileMap)}`;
  }

  private static resolveAsset(baseDir: string, rawPath: string, fileMap: Map<string, Uint8Array>): string | null {
    const resolved = Distpacker.resolvePath(baseDir, Distpacker.cleanRelativePath(rawPath));
    if (fileMap.has(resolved)) return resolved;
    // Case-insensitive fallback (zip tools sometimes change case)
    const lower = resolved.toLowerCase();
    return [...fileMap.keys()].find(key => key.toLowerCase() === lower) || null;
  }

  /** Decode HTML entities in paths (tet.folio encodes & as &amp; in href/src attributes). */
  private static cleanRelativePath(relativePath: string): string {
    const cleanPath = relativePath
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    // Strip query string but keep @ (part of tet.folio filenames)
    return cleanPath.split('?')[0];
  }

  /** Resolve a relative path against a base directory, normalising '..' and '.'. */
  private static resolvePath(base: string, relative: string): string {
    const parts = relative.startsWith('/') ? relative.split('/') : `${base}/${relative}`.split('/');
    const resolved: string[] = [];
    parts.forEach(part => {
      if (part === '' || part === '.') return;
      if (part === '..') {
        resolved.pop();
      } else {
        resolved.push(part);
      }
    });
    return resolved.join('/');
  }

  private static dirname(filePath: string): string {
    const idx = filePath.lastIndexOf('/');
    return idx < 0 ? '.' : filePath.substring(0, idx);
  }

  private static getExtension(filename: string): string {
    const i = filename.lastIndexOf('.');
    return i < 0 ? '' : filename.substring(i + 1);
  }

  /** Escape a string for use inside a double-quoted HTML attribute (srcdoc). */
  private static escapeHtmlAttribute(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;');
  }

  private static base64Encode(filePath: string, fileMap: Map<string, Uint8Array>): string {
    const bytes = fileMap.get(filePath);
    if (!bytes) return '';
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
  }

  private static readText(filePath: string, fileMap: Map<string, Uint8Array>): string {
    const bytes = fileMap.get(filePath);
    if (!bytes) return '';
    return new TextDecoder('utf-8').decode(bytes);
  }

  private static logDebug(str: string): void {
    if (Distpacker.DEBUG) {
      // eslint-disable-next-line no-console
      console.log('[distpacker]', str);
    }
  }
}
