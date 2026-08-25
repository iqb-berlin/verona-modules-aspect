// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { DragNDropValueObject, TextImageLabel } from 'common/models/label-interfaces';
import { PropertyGroupGenerators } from 'common/models/elements/property-group-interfaces';
import { DragImageComponent } from './drag-image.component';

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

describe('DragImageComponent', () => {
  let component: DragImageComponent;
  let fixture: ComponentFixture<DragImageComponent>;

  const testItem: DragNDropValueObject = {
    text: 'Item 1',
    id: 'value_1',
    alias: 'value_1',
    originListID: 'list-id',
    originListIndex: 0,
    imgSrc: null,
    imgFileName: '',
    imgPosition: 'above',
    audioSrc: null,
    audioFileName: ''
  };

  const createSourceElement = (): Element => {
    const sourceElement = document.createElement('div');
    vi.spyOn(sourceElement, 'getBoundingClientRect').mockReturnValue({
      left: 10, top: 20, width: 100, height: 50
    } as DOMRect);
    return sourceElement;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        DragImageComponent,
        MockTextImagePanelComponent
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DragImageComponent);
    component = fixture.componentInstance;
    component.styling = {
      ...PropertyGroupGenerators.generateBasicStyleProps({ fontColor: '#112233', fontSize: 17 }),
      itemBackgroundColor: '#445566'
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render a drag preview initially', () => {
    expect(fixture.nativeElement.querySelector('.drag-preview')).toBeNull();
  });

  it('should set item, dimensions and offset on initDragPreview', () => {
    component.initDragPreview(testItem, createSourceElement(), 30, 40);
    expect(component.draggedItem).toBe(testItem);
    expect(component.dragImageWidth).toBe(100);
    expect(component.dragImageHeight).toBe(50);
    expect(component.dragImageOffsetX).toBe(20); // 30 - 10 (element left)
    expect(component.dragImageOffsetY).toBe(20); // 40 - 20 (element top)
    expect(component.dragImageX).toBe(10);
    expect(component.dragImageY).toBe(20);
    expect(fixture.nativeElement.querySelector('.drag-preview')).not.toBeNull();
  });

  it('should position the preview relative to the grab offset on setDragPreviewPosition', () => {
    component.initDragPreview(testItem, createSourceElement(), 30, 40);
    component.setDragPreviewPosition(50, 60);
    expect(component.dragImageX).toBe(30); // 50 - offsetX (20)
    expect(component.dragImageY).toBe(40); // 60 - offsetY (20)
  });

  /* itemBackgroundColor belongs to the drop list's styling group, not to BasicStyles, which is what
     this input used to be declared as. The binding worked anyway because the styling interfaces
     carried an index signature; nothing checked it. */
  it('should style the preview from the drop list styling, item background included', () => {
    component.initDragPreview(testItem, createSourceElement(), 30, 40);

    const preview = fixture.nativeElement.querySelector('.drag-preview') as HTMLElement;

    expect(preview.style.backgroundColor).toBe('rgb(68, 85, 102)');
    expect(preview.style.color).toBe('rgb(17, 34, 51)');
    expect(preview.style.fontSize).toBe('17px');
  });

  /* The preview keeps the size of the item it was picked up from, so a label shorter than that has to
     sit in its middle -- as it does in the item itself (#970). */
  it('should centre the label in a preview taller than the label', () => {
    component.initDragPreview(testItem, createSourceElement(), 30, 40);

    const preview = fixture.nativeElement.querySelector('.drag-preview') as HTMLElement;
    const label = preview.querySelector('aspect-text-image-panel') as HTMLElement;
    const previewBox = preview.getBoundingClientRect();
    const labelBox = label.getBoundingClientRect();

    expect(previewBox.height).toBeGreaterThan(labelBox.height);
    expect(labelBox.top - previewBox.top).toBeCloseTo(previewBox.bottom - labelBox.bottom, 0);
  });

  it('should remove the drag preview on unsetDragPreview', () => {
    component.initDragPreview(testItem, createSourceElement(), 30, 40);
    component.unsetDragPreview();
    expect(component.draggedItem).toBeUndefined();
    expect(component.dragImageX).toBeUndefined();
    expect(component.dragImageY).toBeUndefined();
    expect(fixture.nativeElement.querySelector('.drag-preview')).toBeNull();
  });
});
