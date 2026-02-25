import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AnchorService } from './anchor.service';

describe('AnchorService', () => {
  let service: AnchorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnchorService);
  });

  afterEach(() => {
    service.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('toggleAnchorRendering', () => {
    let anchor: HTMLElement;
    let nestedAnchor: HTMLElement;

    beforeEach(() => {
      anchor = document.createElement('aspect-anchor');
      anchor.setAttribute('data-anchor-id', 'test-anchor');
      anchor.dataset.anchorColor = 'red';
      anchor.dataset.parentAnchorColor = 'blue';
      anchor.scrollIntoView = jasmine.createSpy('scrollIntoView');
      document.body.appendChild(anchor);

      nestedAnchor = document.createElement('aspect-anchor');
      nestedAnchor.setAttribute('data-parent-anchor-id', 'test-anchor');
      nestedAnchor.dataset.anchorColor = 'green';
      nestedAnchor.dataset.parentAnchorColor = 'yellow';
      document.body.appendChild(nestedAnchor);
    });

    afterEach(() => {
      if (document.body.contains(anchor)) { document.body.removeChild(anchor); }
      if (document.body.contains(nestedAnchor)) { document.body.removeChild(nestedAnchor); }
    });

    it('should show anchor and set correct colors', () => {
      service.showAnchor('test-anchor');

      expect(anchor.classList.contains('active-anchor')).toBeTrue();
      expect(anchor.style.backgroundColor).toEqual('red');

      expect(nestedAnchor.classList.contains('active-nested-anchor')).toBeTrue();
      expect(nestedAnchor.style.backgroundColor).toEqual('yellow');

      expect(anchor.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    });

    it('should hide anchor and set correct colors after duration', fakeAsync(() => {
      service.showAnchor('test-anchor');
      expect(anchor.classList.contains('active-anchor')).toBeTrue();

      tick(60000); // Wait for the duration of the timeout

      expect(anchor.classList.contains('active-anchor')).toBeFalse();
      expect(anchor.style.backgroundColor).toEqual('blue');

      expect(nestedAnchor.classList.contains('active-nested-anchor')).toBeFalse();
      expect(nestedAnchor.style.backgroundColor).toEqual('green');
    }));

    it('should remove anchors from active anchors queue upon reset', () => {
      service.showAnchor('test-anchor');
      expect(anchor.classList.contains('active-anchor')).toBeTrue();

      service.reset();

      expect(anchor.classList.contains('active-anchor')).toBeFalse();
      expect(anchor.style.backgroundColor).toEqual('blue');
    });

    it('should toggle anchor visibility', () => {
      service.toggleAnchor('test-anchor');
      expect(anchor.classList.contains('active-anchor')).toBeTrue();

      service.toggleAnchor('test-anchor');
      expect(anchor.classList.contains('active-anchor')).toBeFalse();
    });

    it('should fall back to anchorColor if parentAnchorColor is missing when hiding', () => {
      delete anchor.dataset.parentAnchorColor;

      service.showAnchor('test-anchor');
      expect(anchor.style.backgroundColor).toEqual('red');

      service.hideAllAnchors();
      expect(anchor.style.backgroundColor).toEqual('red'); // Fallback to anchor color
    });
  });
});
