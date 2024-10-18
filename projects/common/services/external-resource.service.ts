import { Injectable, Renderer2 } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { APIService } from 'common/shared.module';
import { AspectError } from 'common/classes/aspect-error';

@Injectable({
  providedIn: 'root'
})
export class ExternalResourceService {
  geoGebraInitStarted = false;
  isGeoGebraScriptInitialized = new BehaviorSubject<boolean>(this.geoGebraInitStarted);
  resourceUrl: string;

  constructor(private apiService: APIService) {
    this.resourceUrl = apiService.getResourceURL();
  }

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
        throw new AspectError('geogebra-not-loaded', message);
      };
      renderer.appendChild(document.head, script);
    }
  }

  isGeoGebraLoaded(): Observable<boolean> {
    return this.isGeoGebraScriptInitialized as Observable<boolean>;
  }

  getGeoGebraHTML5URL(): string {
    return `${this.resourceUrl}/GeoGebra/GeoGebra/HTML5/5.0/web3d/`;
  }
}
