import { Renderer2 } from '@angular/core';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { APIService } from './api.service';
import { ExternalResourceService } from './external-resource.service';

describe('ExternalResourceService', () => {
  let service: ExternalResourceService;
  let renderer: SpyObj<Renderer2>;
  let scriptElement: HTMLScriptElement;

  const apiService: APIService = { getResourceURL: () => 'http://resource' };

  beforeEach(() => {
    service = new ExternalResourceService(apiService);
    renderer = createSpyObj<Renderer2>(['createElement', 'appendChild']);
    renderer.createElement.mockImplementation(() => {
      scriptElement = document.createElement('script');
      return scriptElement;
    });
    // appendChild stays a plain spy so the script never actually loads
  });

  it('should take the resource URL from the API service', () => {
    expect(service.resourceUrl).toBe('http://resource');
  });

  it('should build the GeoGebra HTML5 URL from the resource URL', () => {
    expect(service.getGeoGebraHTML5URL()).toBe('http://resource/GeoGebra/GeoGebra/HTML5/5.0/web3d/');
  });

  it('should append the GeoGebra script to the document head on initialization', () => {
    service.initializeGeoGebra(renderer);
    expect(service.geoGebraInitStarted).toBe(true);
    expect(scriptElement.type).toBe('text/javascript');
    expect(scriptElement.src).toBe('http://resource/GeoGebra/GeoGebra/deployggb.js');
    expect(renderer.appendChild).toHaveBeenCalledWith(document.head, scriptElement);
  });

  it('should initialize the script only once', () => {
    service.initializeGeoGebra(renderer);
    service.initializeGeoGebra(renderer);
    expect(renderer.createElement).toHaveBeenCalledTimes(1);
  });

  it('should report the loading state before and after the script has loaded', () => {
    const loadedStates: boolean[] = [];
    service.isGeoGebraLoaded().subscribe(loaded => loadedStates.push(loaded));
    expect(loadedStates).toEqual([false]);

    service.initializeGeoGebra(renderer);
    scriptElement.dispatchEvent(new Event('load'));
    expect(loadedStates).toEqual([false, true]);
  });
});
