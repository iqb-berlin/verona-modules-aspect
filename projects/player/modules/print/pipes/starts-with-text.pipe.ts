import { Pipe, PipeTransform } from '@angular/core';
import { InputElement, UIElement } from 'common/models/elements/element';
import { UIElementType } from 'common/models/ui-element-interfaces';
import { TextElement } from 'common/models/elements/text';
import { ClozeElement } from 'common/models/elements/cloze';
import { ButtonElement } from 'common/models/elements/button';
import { ToggleButtonElement } from 'common/models/elements/toggle-button';
import { LikertElement } from 'common/models/elements/likert';

type StartsWithTextRule = boolean | ((element: UIElement) => boolean);

@Pipe({
  name: 'startsWithText',
  standalone: false
})
export class StartsWithTextPipe implements PipeTransform {
  /** The answer per type: fixed, or read from the element where its content decides. */
  private static readonly rules: Record<UIElementType, StartsWithTextRule> = {
    text: element => StartsWithTextPipe.textStartsWithText(element as TextElement),
    cloze: element => StartsWithTextPipe.clozeStartsWithText(element as ClozeElement),
    'spell-correct': true,
    'text-field': true,
    'toggle-button': element => {
      const { options } = element as ToggleButtonElement;
      return options.length > 0 && StartsWithTextPipe.htmlStartsWithText(options[0].text);
    },
    // A button for unit navigation is hidden while the host does not allow its target.
    button: element => {
      const button = element as ButtonElement;
      return !button.imageSrc && button.action !== 'unitNav' && !!button.label?.trim();
    },
    radio: element => StartsWithTextPipe.htmlStartsWithText((element as InputElement).label),
    'radio-group-images': element => StartsWithTextPipe.htmlStartsWithText((element as InputElement).label),
    // These two show their label as plain text, not as HTML.
    'math-field': element => !!(element as InputElement).label?.trim(),
    likert: element => !!(element as LikertElement).label?.trim(),
    'text-field-simple': false,
    'text-area': false,
    checkbox: false,
    dropdown: false,
    image: false,
    audio: false,
    video: false,
    'likert-row': false,
    'hotspot-image': false,
    'drop-list': false,
    slider: false,
    frame: false,
    geometry: false,
    'math-table': false,
    'text-area-math': false,
    'marking-panel': false,
    trigger: false,
    table: false,
    'widget-molecule-editor': false,
    'widget-periodic-table': false,
    tetfolio: false
  };

  /** The node types `ClozeComponent` draws at the top level; any other it leaves out. */
  private static readonly renderedClozeNodes = ['paragraph', 'heading', 'bulletList', 'orderedList', 'blockquote',
    'blockImage'];

  /**
   * Whether an element begins with a line of text, at its top edge.
   *
   * A section numbered on the left aligns its number with the first baseline of its content (#1618).
   * The browser finds that baseline in the first grid item -- and an item without a line of text gets one
   * made up at its bottom edge, which put the number next to the bottom of a picture (#1021). Where this
   * pipe says no, the element gets an invisible first line in the number's font, `.starts-without-text`
   * in the player's styles.scss, and the number stands at its top edge.
   *
   * No is the default, and yes was measured: with the line, an element sits where flex-start put it
   * before #1618, so a wrong no costs nothing. A type is listed as yes only where the number, aligned at
   * the baseline, lands within a pixel of the element's first line of text and did not before. Text area,
   * dropdown and checkbox failed that: their baseline lies below the label, at the end of the field, or in
   * the middle of the row.
   */
  transform(element: UIElement): boolean {
    const rule = StartsWithTextPipe.rules[element.type];
    return typeof rule === 'function' ? rule(element) : rule;
  }

  /** The marking bar stands above the text and holds only pictures. */
  private static textStartsWithText(element: TextElement): boolean {
    if (element.highlightableYellow || element.highlightableTurquoise || element.highlightableOrange) return false;
    return StartsWithTextPipe.htmlStartsWithText(element.text);
  }

  /**
   * Whether rich text begins with text or with a picture, whichever comes first, at any depth: a picture
   * leads in a quote or in a paragraph of its own just as well. An inline picture, which the editor sets
   * 1em high with `vertical-align: middle`, stands in a line of text and is passed over, and so is a rule,
   * which draws no line. A floated picture counts: the text beside it starts at its top only while the
   * picture leaves it room.
   */
  private static htmlStartsWithText(html: string | undefined): boolean {
    if (!html) return false;
    const { body } = new DOMParser().parseFromString(html, 'text/html');
    const walker = body.ownerDocument.createTreeWalker(body, NodeFilter.SHOW_ALL);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) return true;
      if (node.nodeName === 'IMG' && (node as HTMLImageElement).style.verticalAlign !== 'middle') return false;
    }
    return false;
  }

  /**
   * The cloze draws a block image without its float, so a leading one always takes the first line. A
   * document without content is drawn empty, as `ModelNormalizer` lets it through.
   */
  private static clozeStartsWithText(element: ClozeElement): boolean {
    const first = (element.document.content ?? [])
      .find(node => StartsWithTextPipe.renderedClozeNodes.includes(node.type));
    return !!first && first.type !== 'blockImage';
  }
}
