import { Mock } from 'vitest';
import { UnitService } from 'editor/src/app/services/unit.service';
import { GetValidDropListsPipe } from 'editor/src/app/components/properties-panel/pipes/get-valid-drop-lists.pipe';

describe('GetValidDropListsPipe', () => {
  let pipe: GetValidDropListsPipe;
  let getAllDropListElementIDs: Mock;

  beforeEach(() => {
    getAllDropListElementIDs = vi.fn(() => [
      { id: 'drop-list_1', alias: 'DL-1' },
      { id: 'drop-list_2', alias: 'DL-2' }
    ]);
    pipe = new GetValidDropListsPipe({ getAllDropListElementIDs } as unknown as UnitService);
  });

  it('should return an empty array when no ID list is given', () => {
    expect(pipe.transform(undefined)).toEqual([]);
    expect(getAllDropListElementIDs).not.toHaveBeenCalled();
  });

  it('should return all drop lists for an empty ID list', () => {
    expect(pipe.transform([])).toEqual([
      { id: 'drop-list_1', alias: 'DL-1' },
      { id: 'drop-list_2', alias: 'DL-2' }
    ]);
  });

  it('should filter out drop lists that are already connected', () => {
    expect(pipe.transform(['drop-list_1'])).toEqual([
      { id: 'drop-list_2', alias: 'DL-2' }
    ]);
  });
});
