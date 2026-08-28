export interface ImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  uncompressed?: boolean;
  targetMimeType?: string;
  /**
   * Re-encode at `quality` even when the dimensions and the format stay as they are.
   *
   * Without it `scaleImage` hands an image back untouched unless it has to be made smaller or
   * converted, and the quality then decides nothing -- which is what made the slider a no-op for
   * every image the dialog did not also resize (#1398). It stays off for an upload nobody asked to
   * change, so an image still travels through the dialog unaltered when the author only clicks
   * "Speichern"; the dialog turns it on as soon as the slider is moved, and for an image that is
   * already in the unit, where compressing is the whole point (#1378).
   */
  recompress?: boolean;
}

export interface ImageResizeDialogData {
  base64: string;
  options: ImageOptions;
  /**
   * Whether the image is already part of the unit rather than freshly picked from disk. The dialog
   * then says what a second pass costs: `scaleImage` redraws the image onto a canvas, so a JPEG and
   * a WebP come back re-encoded at the chosen quality and a GIF comes back as a still PNG. On the
   * way in there is nothing to lose yet, which is why the sentence is said only here (#1378).
   */
  isEmbedded?: boolean;
  /**
   * Whether something else is pinned to this image's pixels and would not move with it. True for the
   * hotspots of a Bildbereiche element: they are absolute pixel boxes over an image the component
   * renders at its natural size, so shrinking the picture leaves them where they were. The dialog
   * warns as soon as the chosen size would actually be smaller -- compressing without resizing does
   * not move anything (#1378, #1399).
   */
  hasFixedOverlays?: boolean;
}
