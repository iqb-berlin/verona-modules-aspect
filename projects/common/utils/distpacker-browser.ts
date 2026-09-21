/**
 * Browser-compatible distpacker for tet.folio units.
 * Works with an in-memory file map (from an unzipped archive) instead of the filesystem.
 *
 * Zip structure of a tet.folio export:
 *   index.html                                   <- ignored (redirect page)
 *   tetfolio.fu-berlin.de/web/<number>.html      <- entry point
 *   tetfolio.fu-berlin.de/web/style@v=2.1.css
 *   tetfolio.fu-berlin.de/web/app@v=3.0.js
 *   tetfolio.fu-berlin.de/web/images/...
 *
 * Based on tetfolio-distpacker.js by Andreas Fleck and Richard Henck.
 */

const DEBUG = false;

function logDebug(str: string): void {
  if (DEBUG) {
    // eslint-disable-next-line no-console
    console.log('[distpacker-browser]', str);
  }
}

// --- Path utilities (no Node path module) ---

function dirname(filePath: string): string {
  const idx = filePath.lastIndexOf('/');
  return idx < 0 ? '.' : filePath.substring(0, idx);
}

function getExtension(filename: string): string {
  const i = filename.lastIndexOf('.');
  return i < 0 ? '' : filename.substring(i + 1);
}

function normalizeParts(parts: string[]): string {
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

/** Resolve a relative path against a base directory, normalising '..' and '.'. */
function resolvePath(base: string, relative: string): string {
  if (relative.startsWith('/')) return normalizeParts(relative.split('/'));
  return normalizeParts(`${base}/${relative}`.split('/'));
}

// --- MIME ---

function getMimeType(ext: string): string {
  const mimeTypes: Record<string, string> = {
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
    mp4: 'video/mp4',
    webm: 'video/webm',
    woff: 'font/woff',
    woff2: 'font/woff2',
    ttf: 'font/ttf',
    eot: 'application/vnd.ms-fontobject'
  };
  return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
}

// --- Binary / text helpers ---

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function uint8ArrayToString(bytes: Uint8Array): string {
  return new TextDecoder('utf-8').decode(bytes);
}

// --- File map operations ---

/** Decode HTML entities in paths (tet.folio encodes & as &amp; in href/src attributes). */
function cleanRelativePath(relativePath: string): string {
  let cleanPath = relativePath
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Strip query string but keep @ (part of tet.folio filenames)
  [cleanPath] = cleanPath.split('?');
  return cleanPath;
}

function resolveAsset(baseDir: string, rawPath: string, fileMap: Map<string, Uint8Array>): string | null {
  const cleanPath = cleanRelativePath(rawPath);
  const resolved = resolvePath(baseDir, cleanPath);
  if (fileMap.has(resolved)) return resolved;

  // Case-insensitive fallback (zip tools sometimes change case)
  const lower = resolved.toLowerCase();
  const match = [...fileMap.keys()].find(key => key.toLowerCase() === lower);
  return match || null;
}

function base64Encode(filePath: string, fileMap: Map<string, Uint8Array>): string {
  const bytes = fileMap.get(filePath);
  if (!bytes) return '';
  return uint8ArrayToBase64(bytes);
}

function readText(filePath: string, fileMap: Map<string, Uint8Array>): string {
  const bytes = fileMap.get(filePath);
  if (!bytes) return '';
  return uint8ArrayToString(bytes);
}

// --- Replacement functions ---

function replaceUrlInCss(cssString: string, cssDir: string, fileMap: Map<string, Uint8Array>): string {
  const regexUrl = /\burl\([^)]+\)/gi;

  return cssString.replace(regexUrl, match => {
    const urlMatch = match.match(/url\(['"]?([^'"()]+)['"]?\)/i);
    if (!urlMatch) return match;

    const url = urlMatch[1];
    if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) return match;
    if (/[~#%*<>?{|}]/.test(url)) return match;

    const assetPath = resolveAsset(cssDir, url, fileMap);
    if (!assetPath) {
      logDebug(`CSS url() not found: ${url}`);
      return match;
    }

    const ext = getExtension(assetPath);
    const b64 = base64Encode(assetPath, fileMap);
    const mime = getMimeType(ext);
    logDebug(`Replacing URL in CSS: ${url}`);
    return `url(data:${mime};base64,${b64})`;
  });
}

function replaceFavicon(html: string, baseDir: string, fileMap: Map<string, Uint8Array>): string {
  const regex = /<link.*href="(.*?.ico)".*?>/gi;
  return html.replace(regex, (match, href) => {
    const assetPath = resolveAsset(baseDir, href, fileMap);
    if (!assetPath) return match;
    logDebug(`Replacing favicon: ${href}`);
    const b64 = base64Encode(assetPath, fileMap);
    return `<link type="image/x-icon" href="data:image/x-icon;base64,${b64}" />`;
  });
}

function replaceCSSLinks(html: string, baseDir: string, fileMap: Map<string, Uint8Array>): string {
  const regex = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
  return html.replace(regex, (match, href) => {
    const cssPath = resolveAsset(baseDir, href, fileMap);
    if (!cssPath) {
      logDebug(`CSS file not found: ${href}`);
      return match;
    }
    let cssString = readText(cssPath, fileMap);
    logDebug(`Replacing CSS link: ${href}`);
    cssString = replaceUrlInCss(cssString, dirname(cssPath), fileMap);
    return `<style>${cssString}</style>`;
  });
}

function replaceScriptTags(html: string, baseDir: string, fileMap: Map<string, Uint8Array>): string {
  const regex = /<script[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi;
  return html.replace(regex, (match, src) => {
    if (src.startsWith('http://') || src.startsWith('https://')) {
      logDebug(`Skipping external script: ${src}`);
      return match;
    }
    const scriptPath = resolveAsset(baseDir, src, fileMap);
    if (!scriptPath) {
      logDebug(`JS file not found: ${src}`);
      return match;
    }
    const content = readText(scriptPath, fileMap);
    logDebug(`Replacing script: ${src}`);
    return `<script type='text/javascript'>${content}\n</script>`;
  });
}

function replaceImages(html: string, baseDir: string, fileMap: Map<string, Uint8Array>): string {
  const regex = /<img([^>]*src=["']([^"']+)["'][^>]*)>/gi;
  return html.replace(regex, (match, attributes, src) => {
    if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) return match;

    const imagePath = resolveAsset(baseDir, src, fileMap);
    if (!imagePath) {
      logDebug(`Image not found: ${src}`);
      return match;
    }

    const ext = getExtension(imagePath);
    const b64 = base64Encode(imagePath, fileMap);
    const mime = getMimeType(ext);
    logDebug(`Replacing image: ${src}`);

    const newAttributes = attributes.replace(
      /src=["'][^"']+["']/i,
      `src="data:${mime};base64,${b64}"`
    );
    return `<img${newAttributes}>`;
  });
}

/** Replace audio references in tags and string literals (for Howler.js and similar). */
function replaceAudioFiles(html: string, baseDir: string, fileMap: Map<string, Uint8Array>): string {
  const audioRegex = /<(?:audio|source)[^>]*src=["']([^"']+)["'][^>]*>/gi;
  const result = html.replace(audioRegex, (match, src) => {
    if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) return match;

    const audioPath = resolveAsset(baseDir, src, fileMap);
    if (!audioPath) return match;

    const ext = getExtension(audioPath);
    const b64 = base64Encode(audioPath, fileMap);
    const mime = getMimeType(ext);
    logDebug(`Replacing audio: ${src}`);

    return match.replace(
      /src=["'][^"']+["']/i,
      `src="data:${mime};base64,${b64}"`
    );
  });

  return result;
}

/**
 * Replace media file paths that appear as quoted string literals - e.g.
 * JS arrays of animation frames in IMPAL apps
 * (frames = ['images/hotzone-...-0.jpg', ...], preloaded at runtime)
 * or audio paths passed to Howler.js. Relative fetches cannot resolve
 * from a blob/srcdoc document, so these must be inlined as data URIs.
 */
function replaceMediaStringLiterals(html: string, baseDir: string, fileMap: Map<string, Uint8Array>): string {
  const mediaExtensions = [
    'mp3', 'ogg', 'wav', 'm4a', 'aac',
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'
  ];
  const stringLiteralRegex = new RegExp(
    `(['"])([^'"]*\\.(?:${mediaExtensions.join('|')}))\\1`,
    'gi'
  );
  return html.replace(stringLiteralRegex, (match, quote, filePath) => {
    if (filePath.startsWith('data:') || filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return match;
    }
    const assetPath = resolveAsset(baseDir, filePath, fileMap);
    if (!assetPath) return match;

    const ext = getExtension(assetPath);
    const b64 = base64Encode(assetPath, fileMap);
    const mime = getMimeType(ext);
    logDebug(`Replacing media string literal: ${filePath}`);
    return `${quote}data:${mime};base64,${b64}${quote}`;
  });
}

/** Escape a string for use inside a double-quoted HTML attribute (srcdoc). */
function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;');
}

/**
 * Recursively inline nested iframe pages via srcdoc.
 *
 * Tet.folio exports embed the actual experiment as a second HTML file loaded
 * in an <iframe src="1651734.html"> inside the entry page. The outer page
 * accesses iframe.contentWindow (e.g. window.iiwin.jQuery), so the inner
 * document must stay same-origin: srcdoc inherits the parent origin, while a
 * data: URI would create an opaque origin and break that access.
 */
function replaceIframes(
  html: string,
  baseDir: string,
  fileMap: Map<string, Uint8Array>,
  visited: Set<string>
): string {
  const regex = /<iframe([^>]*)src=["']([^"']+)["']([^>]*)>/gi;
  return html.replace(regex, (match, before, src, after) => {
    if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) return match;

    const framePath = resolveAsset(baseDir, src, fileMap);
    if (!framePath) {
      logDebug(`Iframe page not found: ${src}`);
      return match;
    }
    if (visited.has(framePath)) {
      logDebug(`Iframe recursion detected, skipping: ${framePath}`);
      return match;
    }

    logDebug(`Inlining iframe: ${src}`);
    const packedFrame = packHtmlFile(framePath, fileMap, visited);
    return `<iframe${before}srcdoc="${escapeHtmlAttribute(packedFrame)}"${after}>`;
  });
}

/** Run all replacement passes on one HTML file from the map. */
function packHtmlFile(
  htmlPath: string,
  fileMap: Map<string, Uint8Array>,
  visited: Set<string>
): string {
  visited.add(htmlPath);
  const baseDir = dirname(htmlPath);
  let html = readText(htmlPath, fileMap);
  html = replaceFavicon(html, baseDir, fileMap);
  html = replaceCSSLinks(html, baseDir, fileMap);
  html = replaceScriptTags(html, baseDir, fileMap);
  html = replaceImages(html, baseDir, fileMap);
  html = replaceAudioFiles(html, baseDir, fileMap);
  html = replaceMediaStringLiterals(html, baseDir, fileMap);
  html = replaceIframes(html, baseDir, fileMap, visited);
  return html;
}

// --- Entry point detection ---

/**
 * Build a predicate that is true for HTML files NOT referenced as an
 * <iframe src> by any other HTML file in the map. Iframe-referenced pages
 * are inner experiment pages, never the entry.
 */
function buildIframeTargetFilter(fileMap: Map<string, Uint8Array>): (key: string) => boolean {
  const iframeTargets = new Set<string>();
  fileMap.forEach((_, filePath) => {
    if (!filePath.endsWith('.html')) return;
    const html = readText(filePath, fileMap);
    const baseDir = dirname(filePath);
    const regex = /<iframe[^>]*src=["']([^"']+)["']/gi;
    let match = regex.exec(html);
    while (match !== null) {
      const target = resolveAsset(baseDir, match[1], fileMap);
      if (target) iframeTargets.add(target);
      match = regex.exec(html);
    }
  });
  return (key: string) => !iframeTargets.has(key);
}

/**
 * Find the main HTML entry point in the zip file map.
 * 1. Preferred: tetfolio.fu-berlin.de/web/<digits>.html
 * 2. Fallback: any .html in a /web/ directory
 * 3. Last resort: any .html that is not a root-level index.html
 */
export function findEntryHtml(fileMap: Map<string, Uint8Array>): string | null {
  const keys = [...fileMap.keys()];

  // 0. Best source of truth: the root index.html contains a meta refresh
  //    pointing at the real entry, e.g.
  //    <META http-equiv="refresh" content="0;URL=tetfolio.fu-berlin.de/web/2477785.html">
  //    This matters because exports can contain several HTML files in web/
  //    (the entry page plus inner iframe pages).
  // Shallowest match first: exports may wrap everything in a folder, but a
  // nested index.html (e.g. IMPAL/<n>/index.html) must never win over the
  // actual root redirect page.
  const rootIndex = keys
    .filter(k => /(^|\/)index\.html$/i.test(k))
    .sort((a, b) => a.split('/').length - b.split('/').length)[0];
  if (rootIndex) {
    const indexHtml = readText(rootIndex, fileMap);
    const redirect = indexHtml.match(/http-equiv=["']refresh["'][^>]*content=["'][^"']*URL=([^"'>]+)["']/i);
    if (redirect) {
      const target = resolveAsset(dirname(rootIndex), redirect[1].trim(), fileMap);
      if (target) return target;
    }
  }

  // Exports may lack the root index.html and contain several HTML files in
  // web/ (the entry page plus inner iframe pages). The entry is the HTML
  // that no other HTML embeds via <iframe src>.
  const isNotIframeTarget = buildIframeTargetFilter(fileMap);

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

// --- Main export ---

/**
 * Run the distpacker on an in-memory file map.
 *
 * @param fileMap  Map of zip entry paths to their binary content
 * @param entryHtmlPath  Optional: explicit path to the HTML entry. Auto-detected if omitted.
 * @returns The packed single-file HTML string, or null if no entry HTML was found.
 */
export function distpack(
  fileMap: Map<string, Uint8Array>,
  entryHtmlPath?: string
): string | null {
  const entry = entryHtmlPath || findEntryHtml(fileMap);
  if (!entry) {
    // eslint-disable-next-line no-console
    console.error('[distpacker-browser] No HTML entry point found in zip');
    return null;
  }

  logDebug(`Entry HTML: ${entry}`);
  return packHtmlFile(entry, fileMap, new Set<string>());
}
