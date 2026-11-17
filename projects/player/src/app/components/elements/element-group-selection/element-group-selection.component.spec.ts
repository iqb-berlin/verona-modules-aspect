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

  @Component({
    selector: 'aspect-external-app-group-element',
    template: '',
    standalone: false
  })
  class ElementExternalAppGroupStubComponent {
    @Input() elementModel!: UIElement;
    @Input() pageIndex!: number;
  }

  @Component({
    selector: 'aspect-widget-group-element',
    template: '',
    standalone: false
  })
  class ElementWidgetGroupStubComponent {
    @Input() elementModel!: UIElement;
    @Input() pageIndex!: number;
  }

  @Component({
    selector: 'aspect-tetfolio-group-element',
    template: '',
    standalone: false
  })
  class ElementTetfolioGroupStubComponent {
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
        ElementExternalAppGroupStubComponent,
        ElementWidgetGroupStubComponent,
        ElementTetfolioGroupStubComponent,
        StartsWithTextPipe
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ElementGroupSelectionComponent);
    component = fixture.componentInstance;
  });

  /* Every element type, so that a new one is a compile error until this table says where it belongs.
     A type no group claims - the children of a compound and the frame - is played by the base group. */
  const groupOfType: Record<UIElementType, ElementGroupName | undefined> = {
    text: 'textGroup',
    button: 'actionGroup',
    trigger: 'actionGroup',
    'text-field': 'textInputGroup',
    'text-area': 'textInputGroup',
    'spell-correct': 'textInputGroup',
    'text-area-math': 'textInputGroup',
    'math-field': 'textInputGroup',
    checkbox: 'inputGroup',
    dropdown: 'inputGroup',
    radio: 'inputGroup',
    'radio-group-images': 'inputGroup',
    'hotspot-image': 'inputGroup',
    'drop-list': 'inputGroup',
    slider: 'inputGroup',
    audio: 'mediaPlayerGroup',
    video: 'mediaPlayerGroup',
    likert: 'compoundGroup',
    cloze: 'compoundGroup',
    table: 'compoundGroup',
    image: 'interactiveGroup',
    'math-table': 'interactiveGroup',
    'marking-panel': 'interactiveGroup',
    geometry: 'externalAppGroup',
    'widget-periodic-table': 'widgetGroup',
    'widget-molecule-editor': 'widgetGroup',
    tetfolio: 'tetfolioGroup',
    'text-field-simple': undefined,
    'toggle-button': undefined,
    'likert-row': undefined,
    frame: undefined
  };

  /* What the template renders for each group; the group decides which component plays the element. */
  const componentOfGroup: Record<ElementGroupName, string> = {
    textGroup: 'aspect-text-group-element',
    actionGroup: 'aspect-action-group-element',
    textInputGroup: 'aspect-text-input-group-element',
    inputGroup: 'aspect-input-group-element',
    mediaPlayerGroup: 'aspect-media-player-group-element',
    compoundGroup: 'aspect-compound-group-element',
    interactiveGroup: 'aspect-interactive-group-element',
    externalAppGroup: 'aspect-external-app-group-element',
    widgetGroup: 'aspect-widget-group-element',
    tetfolioGroup: 'aspect-tetfolio-group-element'
  };

  const renderedChildren = (): string[] => Array
    .from((fixture.nativeElement.querySelector('[data-element-id]') as HTMLElement).children)
    .map(element => element.tagName.toLowerCase());

  it.each((Object.keys(groupOfType) as UIElementType[])
    .map(type => [type, groupOfType[type] ?? 'no group', groupOfType[type]] as const))(
    'should give an element of type %s %s and render its component alone',
    (type, _, group) => {
      component.elementModel = ElementFactory.createElement({ type, id: 'id', alias: 'alias' });
      fixture.detectChanges();
      expect(renderedChildren())
        .toEqual([group ? componentOfGroup[group] : 'aspect-base-group-element']);
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
