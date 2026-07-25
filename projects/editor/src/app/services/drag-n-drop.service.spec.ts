import { TestBed } from '@angular/core/testing';
import { DragNDropService } from 'editor/src/app/services/drag-n-drop.service';

describe('DragNDropService', () => {
  let service: DragNDropService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DragNDropService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not have a drag in progress initially', () => {
    expect(service.isDragInProgress).toBe(false);
  });

  it('should keep track of a running drag operation', () => {
    service.isDragInProgress = true;
    expect(service.isDragInProgress).toBe(true);
    service.isDragInProgress = false;
    expect(service.isDragInProgress).toBe(false);
  });
});
