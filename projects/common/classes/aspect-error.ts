export class AspectError extends Error {
  code: string;
  name = 'AspectError';
  /**
   * The element the error is about, where there is one -- GeoGebra failing to load is about no element. The editor
   * lists the error at that element (#1537); the player tells the host only `code` and `message`.
   */
  elementId?: string;

  constructor(code: string, message: string, elementId?: string) {
    super(message);
    this.code = code;
    this.elementId = elementId;
  }
}
