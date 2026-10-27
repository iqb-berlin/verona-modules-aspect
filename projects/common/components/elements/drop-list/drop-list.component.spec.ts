// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  Component, Input, Pipe, PipeTransform
} from '@angular/core';
import { By } from '@angular/platform-browser';
import { DropListElement, DropListProperties } from 'common/models/elements/drop-list';
import { DragNDropValueObject, TextImageLabel } from 'common/models/label-interfaces';
import { DragOperatorService } from 'common/services/drag-operator.service';
import { DragImageComponent } from 'common/components/drag-image/drag-image.component';
import { DragStartEvent } from 'common/directives/draggable.directive';
import { TextImagePanelComponent } from 'common/components/text-image-panel/text-image-panel.component';
import { SafeResourceHTMLPipe } from 'common/pipes/safe-resource-html.pipe';
import { SafeResourceUrlPipe } from 'common/pipes/safe-resource-url.pipe';
import { HasRenderableContentPipe } from 'common/pipes/has-renderable-content.pipe';
import { MatIconModule } from '@angular/material/icon';
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
  unregisterComponent: ReturnType<typeof vi.fn>;
  startDrag: ReturnType<typeof vi.fn>;
  endDrag: ReturnType<typeof vi.fn>;
  handleDrop: ReturnType<typeof vi.fn>;
  setTargetList: ReturnType<typeof vi.fn>;
  unSetTargetList: ReturnType<typeof vi.fn>;
  positionSortPlaceholder: ReturnType<typeof vi.fn>;
  isListEligible: ReturnType<typeof vi.fn>;
  checkHoveredListOrElement: ReturnType<typeof vi.fn>;
}

const createDragOperatorServiceMock = (): DragOperatorServiceMock => ({
  isDragActive: false,
  hoveredListID: undefined,
  dragOperation: undefined,
  registerComponent: vi.fn(),
  unregisterComponent: vi.fn(),
  startDrag: vi.fn(),
  endDrag: vi.fn(),
  handleDrop: vi.fn(),
  setTargetList: vi.fn(),
  unSetTargetList: vi.fn(),
  positionSortPlaceholder: vi.fn(),
  isListEligible: vi.fn().mockReturnValue(true),
  checkHoveredListOrElement: vi.fn()
});

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

describe('DropListComponent', () => {
  let component: DropListComponent;
  let fixture: ComponentFixture<DropListComponent>;
  let dragOpServiceMock: DragOperatorServiceMock;

  beforeEach(async () => {
    dragOpServiceMock = createDragOperatorServiceMock();

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

  it('should give itself back at the DragOperatorService when it is destroyed', () => {
    fixture.destroy();

    expect(dragOpServiceMock.unregisterComponent).toHaveBeenCalledWith(component);
  });

  /*
   * The drag image sits in the CDK overlay container, outside this component's view, so it stays in
   * the document unless the component takes it down itself (#1403). Counted relative to what is
   * there, not against zero: an overlay of another test would be counted too.
   */
  it('should dispose its drag image overlay when it is destroyed', () => {
    const panesBefore = document.querySelectorAll('.cdk-overlay-pane').length;

    fixture.destroy();

    expect(document.querySelectorAll('.cdk-overlay-pane').length).toBe(panesBefore - 1);
    expect(component.dragImageRef).toBeUndefined();
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

  /* The list highlight is `:has(.is-playing)` on the item. The panel's own class is covered in
     text-image-panel.component.spec.ts, so these cases put the class on the mock host and check
     that the shadow lands on that item only. */
  it('should highlight only the clicked item when several items share an id in one list', () => {
    const shared = createValueObject('Shared', 'value_1');
    shared.audioSrc = 'data:audio/mpeg;base64,abc';
    component.viewModel = [shared, shared];
    fixture.detectChanges();
    const panels = fixture.debugElement.queryAll(By.css('aspect-text-image-panel'));
    const listItems: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.drop-list-item'));
    listItems.forEach(item => {
      item.style.transition = 'none';
    });
    panels[0].nativeElement.classList.add('is-playing');

    expect(getComputedStyle(listItems[0]).boxShadow).toContain('rgb(0, 96, 100)');
    expect(getComputedStyle(listItems[1]).boxShadow).toBe('none');
  });

  it('should highlight only the clicked item when the same id is in two lists', () => {
    const shared = createValueObject('Shared', 'value_1');
    shared.audioSrc = 'data:audio/mpeg;base64,abc';
    component.viewModel = [shared];
    fixture.detectChanges();

    const secondFixture = TestBed.createComponent(DropListComponent);
    secondFixture.componentInstance.elementModel = new DropListElement({
      type: 'drop-list',
      id: 'test-id-2',
      alias: 'test-alias-2',
      value: [shared]
    } as Partial<DropListProperties>);
    secondFixture.componentInstance.parentForm = new UntypedFormGroup({
      'test-id-2': new UntypedFormControl([shared])
    });
    secondFixture.detectChanges();
    /* A second `createComponent` removes the first fixture's root from the document, and
       `getComputedStyle` then has nothing to compute. */
    document.body.appendChild(fixture.nativeElement.closest('[id^="root"]') as HTMLElement);

    const firstPanel = fixture.debugElement.query(By.css('aspect-text-image-panel'));
    const firstItem: HTMLElement = fixture.nativeElement.querySelector('.drop-list-item');
    const secondItem: HTMLElement = secondFixture.nativeElement.querySelector('.drop-list-item');
    firstItem.style.transition = 'none';
    secondItem.style.transition = 'none';
    firstPanel.nativeElement.classList.add('is-playing');

    expect(getComputedStyle(firstItem).boxShadow).toContain('rgb(0, 96, 100)');
    expect(getComputedStyle(secondItem).boxShadow).toBe('none');
    secondFixture.destroy();
  });

  it('should show an inset teal shadow on the list item while its panel is playing', () => {
    const listItems: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.drop-list-item'));
    listItems.forEach(item => {
      item.style.transition = 'none';
    });
    const panel = fixture.debugElement.query(By.css('aspect-text-image-panel'));
    panel.nativeElement.classList.add('is-playing');

    expect(getComputedStyle(listItems[0]).boxShadow).toContain('rgb(0, 96, 100)');
    expect(getComputedStyle(listItems[1]).boxShadow).toBe('none');

    panel.nativeElement.classList.remove('is-playing');
    expect(getComputedStyle(listItems[0]).boxShadow).toBe('none');
  });
});

/* With the real label panel: its margin is what a word in a gap has to drop. The gap gives its children
   their line; here the host does, with a height to tell it apart from the 36px a list used to inherit
   from the cloze (#1619). */
describe('DropListComponent in a gap', () => {
  let component: DropListComponent;
  let fixture: ComponentFixture<DropListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        DropListComponent,
        DragImageComponent,
        TextImagePanelComponent,
        SafeResourceHTMLPipe,
        SafeResourceUrlPipe,
        HasRenderableContentPipe,
        MockErrorTransformPipe
      ],
      imports: [
        ReactiveFormsModule,
        OverlayModule,
        MatFormFieldModule,
        MatIconModule
      ],
      providers: [
        { provide: DragOperatorService, useValue: createDragOperatorServiceMock() }
      ]
    }).compileComponents();
  });

  const render = (
    value: DragNDropValueObject[], inGap: boolean = true, properties: Partial<DropListProperties> = {}
  ): HTMLElement => {
    fixture = TestBed.createComponent(DropListComponent);
    component = fixture.componentInstance;
    component.elementModel = new DropListElement({
      type: 'drop-list',
      id: 'test-id',
      alias: 'test-alias',
      value,
      ...properties
    } as Partial<DropListProperties>);
    component.parentForm = new UntypedFormGroup({ 'test-id': new UntypedFormControl(value) });
    component.clozeContext = true;
    component.inGap = inGap;
    const host = fixture.nativeElement as HTMLElement;
    host.style.lineHeight = '30px';
    fixture.detectChanges();
    return host;
  };

  it('should make a list with a word its line plus 1px above and below', () => {
    const host = render([createValueObject('Wort', 'value_1')]);

    expect((host.querySelector('.drop-list') as HTMLElement).getBoundingClientRect().height).toBe(32);
  });

  it('should make an empty list as tall, by its strut', () => {
    expect(render([]).getBoundingClientRect().height).toBe(32);
  });

  it('should let the word fill a taller gap', () => {
    const host = render([createValueObject('Wort', 'value_1')]);
    host.style.height = '50px';

    expect((host.querySelector('.drop-list-item') as HTMLElement).getBoundingClientRect().height).toBe(50);
  });

  it.each(['horizontal', 'flex'])('should let the word fill a gap that lines its words up %s', orientation => {
    const host = render([createValueObject('Wort', 'value_1')], true, {
      orientation
    } as Partial<DropListProperties>);
    host.style.width = '200px';
    host.style.height = '50px';
    const list = (host.querySelector('.drop-list') as HTMLElement).getBoundingClientRect();
    const word = (host.querySelector('.drop-list-item') as HTMLElement).getBoundingClientRect();

    expect(word.width).toBe(list.width);
    expect(word.height).toBe(list.height);
  });

  /* As a border, the highlight made a gap without a fixed height 4px taller for as long as a word was
     dragged, and moved its line. */
  it('should keep its size while it is highlighted for a drag', () => {
    const host = render([createValueObject('Wort', 'value_1')]);
    const height = host.getBoundingClientRect().height;
    component.isHighlighted = true;
    fixture.detectChanges();

    expect(host.getBoundingClientRect().height).toBe(height);
    expect(getComputedStyle(host.querySelector('.drop-list') as HTMLElement).outlineWidth).toBe('2px');
  });

  it('should give the strut the font size of the list', () => {
    const host = render([], true, { styling: { fontSize: 28 } } as Partial<DropListProperties>);

    expect((host.querySelector('.baseline-strut') as HTMLElement).style.fontSize).toBe('28px');
  });

  /* Which end of the list the line of an empty one comes from is the browser's choice: Chromium takes the
     first item, CSS the last line. Either is the strut, so both readings agree. */
  it('should end with the strut it begins with', () => {
    const host = render([], true, { styling: { fontSize: 28 } } as Partial<DropListProperties>);
    const first = host.firstElementChild as HTMLElement;
    const last = host.lastElementChild as HTMLElement;

    expect(first.classList).toContain('baseline-strut');
    expect(last.classList).toContain('baseline-strut');
    expect(last.style.fontSize).toBe('28px');
    expect(last.getBoundingClientRect().top).toBe(first.getBoundingClientRect().top);
    expect(last.getBoundingClientRect().height).toBe(first.getBoundingClientRect().height);
  });

  it('should tell its drag image that it is a gap', () => {
    render([createValueObject('Wort', 'value_1')]);

    expect(component.dragImageRef?.instance.inGap).toBe(true);
  });

  /* A table cell asks for the compact look of a gap with `clozeContext`, but keeps the sizes it had. */
  it('should leave a list in a table cell as it was', () => {
    const host = render(
      [createValueObject('Wort', 'value_1')], false, { styling: { fontSize: 28 } } as Partial<DropListProperties>
    );

    expect(getComputedStyle(host.querySelector('.text') as HTMLElement).marginTop).toBe('10px');
    expect(getComputedStyle(host.querySelector('.drop-list-item') as HTMLElement).paddingTop).toBe('0px');
    expect((host.querySelector('.baseline-strut') as HTMLElement).style.fontSize).toBe('');
    expect(host.querySelectorAll('.baseline-strut').length).toBe(1);
  });
});
