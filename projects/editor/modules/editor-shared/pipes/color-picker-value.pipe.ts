import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'colorPickerValue',
  standalone: false
})
export class ColorPickerValuePipe implements PipeTransform {
  /**
   * What a colour picker opens on when the colour it edits has no value of its own: a grey of medium
   * brightness. An `<input type="color">` opens on black instead -- for `transparent`, which is black
   * once its alpha is dropped, for an empty value, and in some browsers for any notation other than
   * `#rrggbb`. In the colour dialog of Windows black is a trap: its spectrum field picks hue and
   * saturation only, so with the brightness bar at zero every click there stays black (#1532).
   */
  static readonly NEUTRAL = '#808080';

  /** Created on first use, so that loading the module does not create a canvas. */
  private static context: CanvasRenderingContext2D | null = null;

  /**
   * The value an `<input type="color">` can open on: the colour itself as `#rrggbb` when it is an
   * opaque sRGB colour (`white`, `#fff`, `rgb(…)` included), otherwise {@link NEUTRAL} -- for
   * `transparent`, a translucent colour, a merged selection (`null`) and anything that is no colour.
   * The canvas does the parsing and hands sRGB colours back as `#rrggbb`; notations of other colour
   * spaces (`oklch(…)`, `color(…)`) come back in their own syntax and open on grey as well.
   */
  transform(color: string | null | undefined): string {
    if (!color) return ColorPickerValuePipe.NEUTRAL;
    ColorPickerValuePipe.context ??= document.createElement('canvas').getContext('2d');
    const context = ColorPickerValuePipe.context;
    if (!context) return ColorPickerValuePipe.NEUTRAL;
    // The canvas keeps its previous fill for a value it cannot parse, so this one stands for "no colour".
    context.fillStyle = 'transparent';
    context.fillStyle = color;
    const normalized = String(context.fillStyle);
    return /^#[0-9a-f]{6}$/.test(normalized) ? normalized : ColorPickerValuePipe.NEUTRAL;
  }
}
