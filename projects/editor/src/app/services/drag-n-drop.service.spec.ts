import { TestBed } from '@angular/core/testing';
import { DragNDropService } from 'editor/src/app/services/drag-n-drop.service';

describe('DragNDropService', () => {
  let service: DragNDropService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DragNDropService);
  });

  /* While the flag is set, the frames of a dynamic section let clicks through (#1590), so the editor
     has to start without a drag. */
  it('should not have a drag in progress initially', () => {
    expect(service.isDragInProgress).toBe(false);
  });
});
