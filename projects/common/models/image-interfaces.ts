export interface ImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  uncompressed?: boolean;
  targetMimeType?: string;
}

export interface ImageResizeDialogData {
  base64: string;
  options: ImageOptions;
}
