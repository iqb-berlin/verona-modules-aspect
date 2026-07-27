import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MetaDataService } from './meta-data.service';

describe('MetaDataService', () => {
  const createDocumentWithMetaData = (metaData: string | null): Document => {
    const documentMock = document.implementation.createHTMLDocument();
    if (metaData !== null) {
      const script = documentMock.createElement('script');
      script.id = 'meta_data';
      script.textContent = metaData;
      documentMock.body.appendChild(script);
    }
    return documentMock;
  };

  const createService = (metaData: string | null): MetaDataService => {
    TestBed.configureTestingModule({
      providers: [
        MetaDataService,
        { provide: DOCUMENT, useValue: createDocumentWithMetaData(metaData) }
      ]
    });
    return TestBed.inject(MetaDataService);
  };

  it('should be created', () => {
    expect(createService(null)).toBeTruthy();
  });

  it('should read the player metadata from the document', () => {
    const service = createService('{ "id": "aspect-player", "version": "1.0.0" }');

    expect(service.playerMetadata.id).toBe('aspect-player');
    expect(service.playerMetadata.version).toBe('1.0.0');
  });

  it('should leave the player metadata unset without a metadata element', () => {
    expect(createService(null).playerMetadata).toBeUndefined();
  });

  it('should fall back to the assets folder as resource URL', () => {
    expect(createService(null).getResourceURL()).toBe('assets');
  });

  it('should return the configured resource URL', () => {
    const service = createService(null);
    service.resourceURL = 'https://example.org/resources';

    expect(service.getResourceURL()).toBe('https://example.org/resources');
  });
});
