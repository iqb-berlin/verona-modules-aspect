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
      anchor.scrollIntoView = vi.fn();
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

      expect(anchor.classList.contains('active-anchor')).toBe(true);
      expect(anchor.style.backgroundColor).toEqual('red');

      expect(nestedAnchor.classList.contains('active-nested-anchor')).toBe(true);
      expect(nestedAnchor.style.backgroundColor).toEqual('yellow');

      expect(anchor.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    });

    it('should hide anchor and set correct colors after duration', fakeAsync(() => {
      service.showAnchor('test-anchor');
      expect(anchor.classList.contains('active-anchor')).toBe(true);

      tick(60000); // Wait for the duration of the timeout

      expect(anchor.classList.contains('active-anchor')).toBe(false);
      expect(anchor.style.backgroundColor).toEqual('blue');

      expect(nestedAnchor.classList.contains('active-nested-anchor')).toBe(false);
      expect(nestedAnchor.style.backgroundColor).toEqual('green');
    }));

    it('should remove anchors from active anchors queue upon reset', () => {
      service.showAnchor('test-anchor');
      expect(anchor.classList.contains('active-anchor')).toBe(true);

      service.reset();

      expect(anchor.classList.contains('active-anchor')).toBe(false);
      expect(anchor.style.backgroundColor).toEqual('blue');
    });

    it('should toggle anchor visibility', () => {
      service.toggleAnchor('test-anchor');
      expect(anchor.classList.contains('active-anchor')).toBe(true);

      service.toggleAnchor('test-anchor');
      expect(anchor.classList.contains('active-anchor')).toBe(false);
    });

    // Highlighting the same passage twice used to orphan the first timer, and that orphan caused two
    // separate defects: it hid the passage when its own minute was up, and -- once the passage had
    // been hidden regularly in between -- it ran into `undefined` (#1346).
    it('should restart the timer when the same anchor is highlighted again', fakeAsync(() => {
      service.showAnchor('test-anchor');
      tick(30000);
      service.showAnchor('test-anchor');

      tick(40000); // past the first minute, inside the second
      expect(anchor.classList.contains('active-anchor')).toBe(true);

      tick(20000); // now the second minute is up as well
      expect(anchor.classList.contains('active-anchor')).toBe(false);
    }));

    it('should keep the anchor visible and scroll to it again when highlighted again', () => {
      service.showAnchor('test-anchor');
      service.showAnchor('test-anchor');

      expect(anchor.classList.contains('active-anchor')).toBe(true);
      expect(nestedAnchor.classList.contains('active-nested-anchor')).toBe(true);
      // Leading the reader to the passage is the point of the action, so a repeat has to scroll too
      expect(anchor.scrollIntoView).toHaveBeenCalledTimes(2);
    });

    // The sequence from the bug report, kept as it was reported
    it('should survive highlighting twice and hiding in between', fakeAsync(() => {
      service.showAnchor('test-anchor');
      tick(5000);
      service.showAnchor('test-anchor');
      tick(5000);
      service.toggleAnchor('test-anchor');
      expect(anchor.classList.contains('active-anchor')).toBe(false);

      expect(() => tick(60000)).not.toThrow();
      expect(anchor.classList.contains('active-anchor')).toBe(false);
    }));

    it('should fall back to anchorColor if parentAnchorColor is missing when hiding', () => {
      delete anchor.dataset.parentAnchorColor;

      service.showAnchor('test-anchor');
      expect(anchor.style.backgroundColor).toEqual('red');

      service.hideAllAnchors();
      expect(anchor.style.backgroundColor).toEqual('red'); // Fallback to anchor color
    });
  });
});
