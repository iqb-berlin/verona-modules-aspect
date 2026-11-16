// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { UIElement } from 'common/models/elements/element';
import { ClozeElement } from 'common/models/elements/cloze';
import { ImageElement } from 'common/models/elements/image';
import { UIElementType } from 'common/models/ui-element-interfaces';
import { ElementFactory } from 'common/utils/element-factory';
import { ElementGroupName } from 'player/src/app/models/element-group.interface';
import { StartsWithTextPipe } from 'player/modules/print/pipes/starts-with-text.pipe';
import { ElementGroupSelectionComponent } from './element-group-selection.component';

describe('ElementGroupSelectionComponent', () => {
  let component: ElementGroupSelectionComponent;
  let fixture: ComponentFixture<ElementGroupSelectionComponent>;

  @Component({
    selector: 'aspect-text-group-element',
    template: '',
    standalone: false
  })
  class ElementTextGroupStubComponent {
    @Input() elementModel!: UIElement;
    @Input() pageIndex!: number;
  }

  @Component({
    selector: 'aspect-input-group-element',
    template: '',
    standalone: false
  })
  class ElementInputGroupStubComponent {
    @Input() elementModel!: UIElement;
    @Input() pageIndex!: number;
  }

  @Component({
    selector: 'aspect-text-input-group-element',
    template: '',
    standalone: false
  })
  class ElementTextInputGroupStubComponent {
    @Input() elementModel!: UIElement;
    @Input() pageIndex!: number;
  }

  @Component({
    selector: 'aspect-media-player-group-element',
    template: '',
    standalone: false
  })
  class ElementMediaPlayerGroupStubComponent {
    @Input() elementModel!: UIElement;
    @Input() pageIndex!: number;
  }

  @Component({
    selector: 'aspect-compound-group-element',
    template: '',
    standalone: false
  })
  class ElementCompoundGroupComponent {
    @Input() elementModel!: UIElement;
    @Input() pageIndex!: number;
  }

  @Component({
    selector: 'aspect-base-group-element',
    template: '',
    standalone: false
  })
  class ElementBaseGroupComponent {
    @Input() elementModel!: UIElement;
    @Input() pageIndex!: number;
  }

  @Component({
    selector: 'aspect-interactive-group-element',
    template: '',
    standalone: false
  })
  class ElementInteractiveGroupComponent {
    @Input() elementModel!: UIElement;
    @Input() pageIndex!: number;
  }

  @Component({
    selector: 'aspect-action-group-element',
    template: '',
    standalone: false
  })
  class ElementActionGroupComponent {
    @Input() elementModel!: UIElement;
    @Input() pageIndex!: number;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ElementGroupSelectionComponent,
        ElementTextGroupStubComponent,
        ElementInputGroupStubComponent,
        ElementTextInputGroupStubComponent,
        ElementMediaPlayerGroupStubComponent,
        ElementCompoundGroupComponent,
        ElementBaseGroupComponent,
        ElementInteractiveGroupComponent,
        ElementActionGroupComponent,
        StartsWithTextPipe
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ElementGroupSelectionComponent);
    component = fixture.componentInstance;
  });

  /* One row per case, named by the element type, so that a failure says which type went to the wrong
     group. A type no group claims gets none and is played by the base group. */
  const groupOfType: [UIElementType, ElementGroupName | undefined][] = [
    ['text', 'textGroup'],
    ['checkbox', 'inputGroup'],
    ['radio', 'inputGroup'],
    ['dropdown', 'inputGroup'],
    ['drop-list', 'inputGroup'],
    ['slider', 'inputGroup'],
    ['text-field', 'textInputGroup'],
    ['text-area', 'textInputGroup'],
    ['spell-correct', 'textInputGroup'],
    ['audio', 'mediaPlayerGroup'],
    ['video', 'mediaPlayerGroup'],
    ['likert', 'compoundGroup'],
    ['cloze', 'compoundGroup'],
    ['image', 'interactiveGroup'],
    ['button', 'actionGroup'],
    ['frame', undefined]
  ];

  it.each(groupOfType.map(([type, group]) => [type, group ?? 'no group', group] as const))(
    'should give an element of type %s %s',
    (type, _, group) => {
      component.elementModel = ElementFactory.createElement({ type, id: 'id', alias: 'alias' });
      fixture.detectChanges();
      expect(component.selectedGroup).toEqual(group);
    }
  );

  it('should give an element without a line of text at its top an invisible first line', () => {
    component.elementModel = new ImageElement({ id: 'id', alias: 'alias' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-element-id]').classList).toContain('starts-without-text');
  });

  it('should leave an element that begins with a line of text as it is', () => {
    component.elementModel = new ClozeElement({ id: 'id', alias: 'alias' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-element-id]').classList).not.toContain('starts-without-text');
  });
});
