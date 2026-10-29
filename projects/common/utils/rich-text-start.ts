/** What stands first in a piece of rich text as the editor stores it: a line of text, or a picture. */
export abstract class RichTextStart {
  /**
   * Whether rich text begins with text or with a picture, whichever comes first, at any depth: a picture
   * leads in a quote or in a paragraph of its own just as well. An inline picture, which the editor sets
   * 1em high with `vertical-align: middle`, stands in a line of text and is passed over, and so is a rule,
   * which draws no line. A floated picture counts: the text beside it starts at its top only while the
   * picture leaves it room.
   */
  static isText(html: string | undefined): boolean {
    if (!html) return false;
    const { body } = new DOMParser().parseFromString(html, 'text/html');
    const walker = body.ownerDocument.createTreeWalker(body, NodeFilter.SHOW_ALL);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) return true;
      if (node.nodeName === 'IMG' && (node as HTMLImageElement).style.verticalAlign !== 'middle') return false;
    }
    return false;
  }
}
