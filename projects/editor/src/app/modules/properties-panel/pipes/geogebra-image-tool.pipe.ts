import { Pipe, PipeTransform } from '@angular/core';
import { GeoGebraToolbar } from 'common/utils/geogebra-toolbar';

/** Whether a toolbar typed into "Anpassung Werkzeugleiste" names the tool "Bild", which the applet does
 * not offer (#1700). Nothing for a selection whose toolbars differ. */
@Pipe({
  name: 'geoGebraImageTool',
  standalone: false
})
export class GeoGebraImageToolPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(customToolbar: string | null | undefined): boolean {
    return GeoGebraToolbar.hasImageTool(customToolbar);
  }
}
