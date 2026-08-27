import { Injectable, Renderer2 } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { APIService } from 'common/services/api.service';

import { AspectError } from 'common/classes/aspect-error';

/**
 * Loads GeoGebra, which is not bundled but fetched as a script at runtime -- once per application, no
 * matter how many geometry elements a unit has.
 */
@Injectable({
  providedIn: 'root'
})
export class ExternalResourceService {
  /** Set before the script starts loading, so a second element does not add a second script tag. */
  geoGebraInitStarted = false;
  isGeoGebraScriptInitialized = new BehaviorSubject<boolean>(this.geoGebraInitStarted);
  resourceUrl: string;

  constructor(private apiService: APIService) {
    this.resourceUrl = apiService.getResourceURL();
  }

  /**
   * Starts loading the GeoGebra script from wherever the application says its resources are, and
   * announces the load through `isGeoGebraLoaded`. Calling it again while the first load is under way
   * or done changes nothing.
   *
   * A failing load throws from the `onerror` callback, so the error does not reach this caller but
   * Angular's error handler -- and the two applications do different things with it: the player reports
   * `geogebra-not-loading` to the host, while the editor excludes exactly this code from its snackbar.
   */
  initializeGeoGebra(renderer: Renderer2): void {
    if (!this.geoGebraInitStarted) {
      this.geoGebraInitStarted = true;
      const script = renderer.createElement('script');
      script.type = 'text/javascript';
      script.src = `${this.resourceUrl}/GeoGebra/GeoGebra/deployggb.js`;
      script.onload = () => {
        this.isGeoGebraScriptInitialized.next(true);
      };
      script.onerror = (message: string) => {
        throw new AspectError('geogebra-not-loading', message);
      };
      renderer.appendChild(document.head, script);
    }
  }

  /** Whether the script is there. Being a `BehaviorSubject`, a late subscriber is told at once -- an
      element created after the load does not wait for a signal that has already passed. */
  isGeoGebraLoaded(): Observable<boolean> {
    return this.isGeoGebraScriptInitialized as Observable<boolean>;
  }

  getGeoGebraHTML5URL(): string {
    return `${this.resourceUrl}/GeoGebra/GeoGebra/HTML5/5.0/web3d/`;
  }
}
