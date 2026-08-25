// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  Component, Input, Pipe, PipeTransform
} from '@angular/core';
import { DropListElement, DropListProperties } from 'common/models/elements/drop-list';
import { DragNDropValueObject, TextImageLabel } from 'common/models/label-interfaces';
import { DragOperatorService } from 'common/services/drag-operator.service';
import { DragImageComponent } from 'common/components/input-group-elements/drag-image/drag-image.component';
import { DragStartEvent } from 'common/directives/draggable.directive';
import { DropListComponent } from './drop-list.component';

@Component({
  selector: 'aspect-text-image-panel',
  template: '',
  /* A height of its own, so that the layout tests can tell stretched from centred -- a label that fills
     its box measures the same either way -- and the `align-self` the real panel asks its parent for. */
  styles: [':host { display: block; height: 20px; align-self: center; }'],
  standalone: false
})
class MockTextImagePanelComponent {
  @Input() label!: TextImageLabel | DragNDropValueObject;
  @Input() hideContent: boolean = false;
}

@Pipe({ name: 'errorTransform', standalone: false })
class MockErrorTransformPipe implements PipeTransform {
  transform(): string { return 'Error'; }
}

interface DragOperatorServiceMock {
  isDragActive: boolean;
  hoveredListID: string | undefined;
  dragOperation: undefined;
  registerComponent: ReturnType<typeof vi.fn>;
  startDrag: ReturnType<typeof vi.fn>;
  endDrag: ReturnType<typeof vi.fn>;
  handleDrop: ReturnType<typeof vi.fn>;
  setTargetList: ReturnType<typeof vi.fn>;
  unSetTargetList: ReturnType<typeof vi.fn>;
  positionSortPlaceholder: ReturnType<typeof vi.fn>;
  isListEligible: ReturnType<typeof vi.fn>;
  checkHoveredListOrElement: ReturnType<typeof vi.fn>;
}

describe('DropListComponent', () => {
  let component: DropListComponent;
  let fixture: ComponentFixture<DropListComponent>;
  let dragOpServiceMock: DragOperatorServiceMock;

  const createValueObject = (text: string, id: string): DragNDropValueObject => ({
    text,
    id,
    alias: id,
    originListID: 'test-id',
    originListIndex: 0,
    imgSrc: null,
    imgFileName: '',
    imgPosition: 'above',
    audioSrc: null,
    audioFileName: ''
  });

  beforeEach(async () => {
    dragOpServiceMock = {
      isDragActive: false,
      hoveredListID: undefined,
      dragOperation: undefined,
      registerComponent: vi.fn(),
      startDrag: vi.fn(),
      endDrag: vi.fn(),
      handleDrop: vi.fn(),
      setTargetList: vi.fn(),
      unSetTargetList: vi.fn(),
      positionSortPlaceholder: vi.fn(),
      isListEligible: vi.fn().mockReturnValue(true),
      checkHoveredListOrElement: vi.fn()
    };

    await TestBed.configureTestingModule({
      declarations: [
        DropListComponent,
        DragImageComponent,
        MockTextImagePanelComponent,
        MockErrorTransformPipe
      ],
      imports: [
        ReactiveFormsModule,
        OverlayModule,
        MatFormFieldModule
      ],
      providers: [
        { provide: DragOperatorService, useValue: dragOpServiceMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DropListComponent);
    component = fixture.componentInstance;
    component.elementModel = new DropListElement({
      type: 'drop-list',
      id: 'test-id',
      alias: 'test-alias',
      value: [createValueObject('Item 1', 'value_1'), createValueObject('Item 2', 'value_2')]
    } as Partial<DropListProperties>);
    component.parentForm = new UntypedFormGroup({
      'test-id': new UntypedFormControl(component.elementModel.value)
    });
    fixture.detectChanges();
  });

  afterEach(() => {
    document.body.classList.remove('dragging-active');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should register itself at the DragOperatorService', () => {
    expect(dragOpServiceMock.registerComponent).toHaveBeenCalledWith(component);
  });

  it('should fill the viewModel from the form control value', () => {
    expect(component.viewModel.length).toBe(2);
    expect(component.viewModel[0].text).toBe('Item 1');
    expect(component.viewModel[1].text).toBe('Item 2');
  });

  it('should render one list item per value object', () => {
    const listItems = fixture.nativeElement.querySelectorAll('.drop-list-item');
    expect(listItems.length).toBe(2);
  });

  /* An item is stretched to the tallest one of its row, so a label shorter than that has to sit in the
     item's middle instead of at its top edge (#970). */
  it('should centre a label vertically in an item taller than the label', () => {
    const listItem: HTMLElement = fixture.nativeElement.querySelector('.drop-list-item');
    listItem.style.height = '100px';
    const label = listItem.querySelector('aspect-text-image-panel') as HTMLElement;
    const itemBox = listItem.getBoundingClientRect();
    const labelBox = label.getBoundingClientRect();

    expect(itemBox.height).toBeGreaterThan(labelBox.height);
    expect(labelBox.top - itemBox.top).toBeCloseTo(itemBox.bottom - labelBox.bottom, 0);
  });

  it('should render numbering when showNumbering is set', () => {
    component.elementModel.showNumbering = true;
    fixture.detectChanges();
    const numberings = fixture.nativeElement.querySelectorAll('.numbering');
    expect(numberings.length).toBe(2);
    expect(numberings[0].textContent.trim()).toBe('1.');
  });

  it('should not start a drag operation while another drag is active', () => {
    dragOpServiceMock.isDragActive = true;
    const event: DragStartEvent = {
      sourceElement: document.createElement('div'), x: 0, y: 0, dragType: 'mouse'
    };
    component.dragStart(event, component.viewModel[0], 0, component);
    expect(dragOpServiceMock.startDrag).not.toHaveBeenCalled();
  });

  it('should start and end a drag operation', () => {
    const item = component.viewModel[0];
    const event: DragStartEvent = {
      sourceElement: document.createElement('div'), x: 5, y: 5, dragType: 'mouse'
    };
    component.dragStart(event, item, 0, component);
    expect(dragOpServiceMock.startDrag)
      .toHaveBeenCalledWith(event.sourceElement, component, 0, item, 'mouse');
    expect(component.dragImageRef?.instance.draggedItem).toBe(item);
    expect(document.body.classList).toContain('dragging-active');

    component.endDragOperation();
    expect(dragOpServiceMock.endDrag).toHaveBeenCalled();
    expect(component.dragImageRef?.instance.draggedItem).toBeUndefined();
    expect(document.body.classList).not.toContain('dragging-active');
  });

  it('should mark itself as hovered and set the target list on dragEnter', () => {
    component.dragEnter();
    expect(component.isHovered).toBe(true);
    expect(dragOpServiceMock.setTargetList).toHaveBeenCalledWith('test-id');
  });

  /* Windows 10 + Firefox sends a second mouseenter after a reorder, and taking it would reset the
     sorting index to where the drag started (e3dbfe27). The list the pointer is already on is the
     one to ignore - which is also what tells this case apart from entering a different list, the
     distinction a plain hovered/not-hovered flag could not make (#1322). */
  it('should ignore dragEnter for the list the pointer is already on', () => {
    dragOpServiceMock.hoveredListID = 'test-id';
    component.dragEnter();
    expect(dragOpServiceMock.setTargetList).not.toHaveBeenCalled();
    expect(component.isHovered).toBe(false);
  });

  it('should refresh the viewModel from the form control value', () => {
    component.elementFormControl.setValue([createValueObject('Item 3', 'value_3')]);
    component.refreshViewModel();
    expect(component.viewModel.length).toBe(1);
    expect(component.viewModel[0].text).toBe('Item 3');
  });
});
