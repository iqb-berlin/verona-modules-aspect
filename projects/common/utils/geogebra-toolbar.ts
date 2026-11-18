/**
 * GeoGebra's toolbar as a string of tool numbers, the way the parameter `customToolBar` and the field
 * "Anpassung Werkzeugleiste" take it: `|` separates the buttons, `,` separates sections inside a
 * button's menu, and the numbers in between are the tools (`0 73 62 | 1 501 67 , 5 19`).
 *
 * The tool "Bild" (26) lets a person upload a file from their device or take a photo with the camera
 * and puts the picture into the drawing (#1700). GeoGebra's default toolbar has it in the menu of the
 * slider; a toolbar typed into the editor can have it as well.
 */
export class GeoGebraToolbar {
  static readonly IMAGE_TOOL = '26';

  /** The move tool, which every toolbar starts with. */
  private static readonly MOVE_TOOL = '0';

  /** Whether the toolbar offers the tool "Bild": 26 as a number of its own, not part of 126 or 260. */
  static hasImageTool(items: string | null | undefined): boolean {
    return !!items && GeoGebraToolbar.toolsOf(items).includes(GeoGebraToolbar.IMAGE_TOOL);
  }

  /**
   * The toolbar without the tool "Bild". A section or button left empty goes with it. A toolbar of
   * nothing but that tool becomes the move tool: an empty one is GeoGebra's default toolbar, which
   * has the tool again.
   */
  static withoutImageTool(items: string): string {
    const buttons = items.split('|')
      .map(button => button.split(',')
        .map(section => GeoGebraToolbar.toolsOf(section)
          .filter(tool => tool !== GeoGebraToolbar.IMAGE_TOOL)
          .join(' '))
        .filter(section => section)
        .join(' , '))
      .filter(button => button);
    return buttons.length ? buttons.join(' | ') : GeoGebraToolbar.MOVE_TOOL;
  }

  /** The toolbar an applet shows, from its `getPerspectiveXML()`: GeoGebra writes it there also when it
   * is the default one, which the file and the element leave unnamed. Undefined without a toolbar. */
  static itemsOf(perspectiveXml: string): string | undefined {
    return perspectiveXml.match(/<toolbar\b[^>]*\bitems="([^"]*)"/)?.[1];
  }

  private static toolsOf(items: string): string[] {
    return items.split(/[\s|,]+/).filter(tool => tool);
  }
}
