// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { UIElement } from 'common/models/elements/element';
import { CheckboxElement } from 'common/models/elements/input-elements/checkbox';
import { TextElement } from 'common/models/elements/text/text';
import { RadioButtonGroupElement } from 'common/models/elements/input-elements/radio-button-group';
import { DropdownElement } from 'common/models/elements/input-elements/dropdown';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import { SliderElement } from 'common/models/elements/input-elements/slider';
import { TextFieldElement } from 'common/models/elements/input-elements/text-field';
import { TextAreaElement } from 'common/models/elements/input-elements/text-area';
import { SpellCorrectElement } from 'common/models/elements/input-elements/spell-correct';
import { AudioElement } from 'common/models/elements/media-elements/audio';
import { VideoElement } from 'common/models/elements/media-elements/video';
import { LikertElement } from 'common/models/elements/compound-elements/likert/likert';
import { ClozeElement } from 'common/models/elements/compound-elements/cloze/cloze';
import { FrameElement } from 'common/models/elements/frame/frame';
import { ImageElement } from 'common/models/elements/media-elements/image';
import { ButtonElement } from 'common/models/elements/button/button';
import { ElementGroupSelectionComponent } from './element-group-selection.component';

describe('ElementGroupSelectionComponent', () => {
  let component: ElementGroupSelectionComponent;
  let fixture: ComponentFixture<ElementGroupSelectionComponent>;

  @Component({ selector: 'aspect-text-group-element', template: '' })
  class ElementTextGroupStubComponent {
    @Input() elementModel!: UIElement;
    @Input() pageIndex!: number;
  }

  @Component({ selector: 'aspect-input-group-element', template: '' })
  class ElementInputGroupStubComponent {
    @Input() elementModel!: UIElement;
    @Input() pageIndex!: number;
  }

  @Component({ selector: 'aspect-text-input-group-element', template: '' })
  class ElementTextInputGroupStubComponent {
    @Input() elementModel!: UIElement;
    @Input() pageIndex!: number;
  }

  @Component({ selector: 'aspect-media-player-group-element', template: '' })
  class ElementMediaPlayerGroupStubComponent {
    @Input() elementModel!: UIElement;
    @Input() pageIndex!: number;
  }

  @Component({ selector: 'aspect-compound-group-element', template: '' })
  class ElementCompoundGroupComponent {
    @Input() elementModel!: UIElement;
    @Input() pageIndex!: number;
  }

  @Component({ selector: 'aspect-base-group-element', template: '' })
  class ElementBaseGroupComponent {
    @Input() elementModel!: UIElement;
    @Input() pageIndex!: number;
  }

  @Component({ selector: 'aspect-interactive-group-element', template: '' })
  class ElementInteractiveGroupComponent {
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
        ElementInteractiveGroupComponent
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ElementGroupSelectionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.elementModel = new CheckboxElement({ id: 'id', alias: 'alias' });
    expect(component).toBeTruthy();
  });

  it('should select textGroup', () => {
    component.elementModel = new TextElement({ id: 'id', alias: 'alias' });
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('textGroup');
  });

  it('should select inputGroup', () => {
    component.elementModel = new CheckboxElement({ id: 'id', alias: 'alias' });
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('inputGroup');
  });

  it('should select inputGroup', () => {
    component.elementModel = new RadioButtonGroupElement({ id: 'id', alias: 'alias' });
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('inputGroup');
  });

  it('should select inputGroup', () => {
    component.elementModel = new DropdownElement({ id: 'id', alias: 'alias' });
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('inputGroup');
  });

  it('should select inputGroup', () => {
    component.elementModel = new DropListElement({ id: 'id', alias: 'alias' });
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('inputGroup');
  });

  it('should select inputGroup', () => {
    component.elementModel = new SliderElement({ id: 'id', alias: 'alias' });
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('inputGroup');
  });

  it('should select inputGroup', () => {
    component.elementModel = new RadioButtonGroupElement({ id: 'id', alias: 'alias' });
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('inputGroup');
  });

  it('should select textInputGroup', () => {
    component.elementModel = new TextFieldElement({ id: 'id', alias: 'alias' });
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('textInputGroup');
  });

  it('should select textInputGroup', () => {
    component.elementModel = new TextAreaElement({ id: 'id', alias: 'alias' });
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('textInputGroup');
  });

  it('should select textInputGroup', () => {
    component.elementModel = new SpellCorrectElement({ id: 'id', alias: 'alias' });
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('textInputGroup');
  });

  it('should select mediaPlayerGroup', () => {
    component.elementModel = new AudioElement({ id: 'id', alias: 'alias' });
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('mediaPlayerGroup');
  });

  it('should select mediaPlayerGroup', () => {
    component.elementModel = new VideoElement({ id: 'id', alias: 'alias' });
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('mediaPlayerGroup');
  });

  it('should select compoundGroup', () => {
    component.elementModel = new LikertElement({ id: 'id', alias: 'alias' });
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('compoundGroup');
  });

  it('should select mediaPlayerGroup', () => {
    component.elementModel = new ClozeElement({ id: 'id', alias: 'alias' });
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('compoundGroup');
  });

  it('should select no group (undefined)', () => {
    component.elementModel = new FrameElement({ id: 'id', alias: 'alias' });
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual(undefined);
  });

  it('should select interactiveGroup', () => {
    component.elementModel = new ImageElement({ id: 'id', alias: 'alias' });
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('interactiveGroup');
  });

  it('should select interactiveGroup', () => {
    component.elementModel = new ButtonElement({ id: 'id', alias: 'alias' });
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('interactiveGroup');
  });
});
