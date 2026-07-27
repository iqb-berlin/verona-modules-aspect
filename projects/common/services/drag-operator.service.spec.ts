import { Mock } from 'vitest';
import { DropListComponent } from 'common/components/input-group-elements/drop-list/drop-list.component';
import { DragNDropValueObject } from 'common/models/label-interfaces';
import { DragOperatorService } from './drag-operator.service';

interface FakeDropListModel {
  id: string;
  isSortList: boolean;
  onlyOneItem: boolean;
  connectedTo: string[];
  copyOnDrop: boolean;
  allowReplacement: boolean;
  permanentPlaceholders: boolean;
  highlightReceivingDropList: boolean;
}

interface FakeDropList {
  elementModel: FakeDropListModel;
  elementFormControl: { value: DragNDropValueObject[] };
  viewModel: DragNDropValueObject[];
  cdr: { detectChanges: Mock };
  isHovered: boolean;
  isHighlighted: boolean;
  updateFormvalue: Mock;
  refreshViewModel: Mock;
  dragEnter: Mock;
  dragLeave: Mock;
}

describe('DragOperatorService', () => {
  let service: DragOperatorService;
  let sourceElement: HTMLElement;

  const createValue = (id: string, originListID: string): DragNDropValueObject => ({
    id,
    alias: id,
    text: id,
    imgSrc: null,
    imgFileName: '',
    imgPosition: 'above',
    originListID,
    originListIndex: 0,
    audioSrc: null,
    audioFileName: ''
  });

  const createDropList = (id: string,
                          modelOverrides: Partial<FakeDropListModel> = {},
                          value: DragNDropValueObject[] = []): FakeDropList => ({
    elementModel: {
      id,
      isSortList: false,
      onlyOneItem: false,
      connectedTo: [],
      copyOnDrop: false,
      allowReplacement: false,
      permanentPlaceholders: false,
      highlightReceivingDropList: false,
      ...modelOverrides
    },
    elementFormControl: { value },
    viewModel: [...value],
    cdr: { detectChanges: vi.fn() },
    isHovered: false,
    isHighlighted: false,
    updateFormvalue: vi.fn(),
    refreshViewModel: vi.fn(),
    dragEnter: vi.fn(),
    dragLeave: vi.fn()
  });

  const register = (fakeDropList: FakeDropList): void => {
    service.registerComponent(fakeDropList as unknown as DropListComponent);
  };

  const startDrag = (fakeDropList: FakeDropList, item: DragNDropValueObject): void => {
    service.startDrag(sourceElement, fakeDropList as unknown as DropListComponent, 0, item, 'mouse');
  };

  beforeEach(() => {
    service = new DragOperatorService();
    sourceElement = document.createElement('div');
  });

  it('should register drop lists under their element id', () => {
    const dropList = createDropList('list-1');
    register(dropList);
    expect(service.dropLists['list-1']).toBe(dropList as unknown as DropListComponent);
  });

  it('should mark the drag as active and collect the eligible connected target lists', () => {
    const item = createValue('item-1', 'source');
    const source = createDropList('source', { connectedTo: ['target'] }, [item]);
    const target = createDropList('target');
    const unconnected = createDropList('unconnected');
    [source, target, unconnected].forEach(register);

    startDrag(source, item);

    expect(service.isDragActive).toBe(true);
    expect(service.dragOperation?.eligibleTargetListsIDs).toEqual(['target']);
    expect(service.isListEligible('target')).toBe(true);
    expect(service.isListEligible('unconnected')).toBe(false);
  });

  it('should show the dragged element as placeholder when the source list does not copy on drop', () => {
    const item = createValue('item-1', 'source');
    const source = createDropList('source', {}, [item]);
    register(source);

    startDrag(source, item);

    expect(sourceElement.classList.contains('show-as-placeholder')).toBe(true);
    expect(sourceElement.style.pointerEvents).toBe('none');
    expect(source.isHovered).toBe(true);
  });

  it('should keep the dragged element visible when the source list copies on drop', () => {
    const item = createValue('item-1', 'source');
    const source = createDropList('source', { copyOnDrop: true }, [item]);
    register(source);

    startDrag(source, item);

    expect(sourceElement.classList.contains('show-as-placeholder')).toBe(false);
  });

  it('should highlight eligible target lists when the source list demands it', () => {
    const item = createValue('item-1', 'source');
    const source = createDropList('source', { connectedTo: ['target'], highlightReceivingDropList: true }, [item]);
    const target = createDropList('target');
    [source, target].forEach(register);

    startDrag(source, item);

    expect(target.isHighlighted).toBe(true);
    expect(target.cdr.detectChanges).toHaveBeenCalled();
  });

  it('should reset the drag state and list effects on endDrag', () => {
    const item = createValue('item-1', 'source');
    const source = createDropList('source', { connectedTo: ['target'], highlightReceivingDropList: true }, [item]);
    const target = createDropList('target');
    [source, target].forEach(register);
    startDrag(source, item);

    service.endDrag();

    expect(service.isDragActive).toBe(false);
    expect(sourceElement.classList.contains('show-as-placeholder')).toBe(false);
    expect(sourceElement.style.pointerEvents).toBe('auto');
    expect(source.isHovered).toBe(false);
    expect(target.isHighlighted).toBe(false);
  });

  it('should move the dragged item to the target list on drop', () => {
    const item = createValue('item-1', 'source');
    const source = createDropList('source', { connectedTo: ['target'] }, [item]);
    const target = createDropList('target');
    [source, target].forEach(register);
    startDrag(source, item);
    service.setTargetList('target');

    service.handleDrop();

    expect(source.elementFormControl.value).toEqual([]);
    expect(target.elementFormControl.value).toEqual([item]);
    expect(source.updateFormvalue).toHaveBeenCalled();
    expect(target.updateFormvalue).toHaveBeenCalled();
    expect(source.refreshViewModel).toHaveBeenCalled();
    expect(target.refreshViewModel).toHaveBeenCalled();
  });

  it('should not change a non-sort list when the item is dropped back on it', () => {
    const item = createValue('item-1', 'source');
    const source = createDropList('source', {}, [item]);
    register(source);
    startDrag(source, item);
    service.setTargetList('source');

    service.handleDrop();

    expect(source.elementFormControl.value).toEqual([item]);
    expect(source.updateFormvalue).not.toHaveBeenCalled();
  });

  it('should track the sorting placeholder of a sort list and clear it on unSetTargetList', () => {
    const item = createValue('item-1', 'source');
    const source = createDropList('source', { isSortList: true }, [item]);
    register(source);
    startDrag(source, item);

    service.setTargetList('source');
    expect(service.dragOperation?.sortingPlaceholderIndex).toBe(0);
    expect(service.isListHovered).toBe(true);

    service.unSetTargetList();
    expect(service.dragOperation?.targetComponent).toBeUndefined();
    expect(service.dragOperation?.sortingPlaceholderIndex).toBeUndefined();
    expect(service.isListHovered).toBe(false);
  });
});
