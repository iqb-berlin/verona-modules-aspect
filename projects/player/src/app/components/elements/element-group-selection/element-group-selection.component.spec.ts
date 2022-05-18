import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementGroupSelectionComponent } from './element-group-selection.component';
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

describe('ElementGroupSelectionComponent', () => {
  let component: ElementGroupSelectionComponent;
  let fixture: ComponentFixture<ElementGroupSelectionComponent>;

  @Component({ selector: 'aspect-element-text-group', template: '' })
  class ElementTextGroupStubComponent {
    @Input() elementModel!: UIElement;
    @Input() pageIndex!: number;
  }

  @Component({ selector: 'aspect-element-input-group', template: '' })
  class ElementInputGroupStubComponent {
    @Input() elementModel!: UIElement;
    @Input() pageIndex!: number;
  }

  @Component({ selector: 'aspect-element-text-input-group', template: '' })
  class ElementTextInputGroupStubComponent {
    @Input() elementModel!: UIElement;
    @Input() pageIndex!: number;
  }

  @Component({ selector: 'aspect-element-media-player-group', template: '' })
  class ElementMediaPlayerGroupStubComponent {
    @Input() elementModel!: UIElement;
    @Input() pageIndex!: number;
  }

  @Component({ selector: 'aspect-element-compound-group', template: '' })
  class ElementCompoundGroupComponent {
    @Input() elementModel!: UIElement;
    @Input() pageIndex!: number;
  }

  @Component({ selector: 'aspect-element-base-group', template: '' })
  class ElementBaseGroupComponent {
    @Input() elementModel!: UIElement;
    @Input() pageIndex!: number;
  }

  @Component({ selector: 'aspect-element-interactive-group', template: '' })
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
    component.elementModel = new CheckboxElement({
      type: 'checkbox',
      id: 'test',
      width: 0,
      height: 0
    });
    expect(component).toBeTruthy();
  });

  it('should select textGroup', () => {
    component.elementModel = new TextElement({
      type: 'text',
      id: 'test',
      width: 0,
      height: 0
    });
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('textGroup');
  });

  it('should select inputGroup', () => {
    component.elementModel = new CheckboxElement({
      type: 'checkbox',
      id: 'test',
      width: 0,
      height: 0
    });
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('inputGroup');
  });

  it('should select inputGroup', () => {
    component.elementModel = new RadioButtonGroupElement({
      type: 'radio',
      id: 'test',
      width: 0,
      height: 0
    });
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('inputGroup');
  });

  it('should select inputGroup', () => {
    component.elementModel = new DropdownElement({
      type: 'dropdown',
      id: 'test',
      width: 0,
      height: 0
    });
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('inputGroup');
  });

  it('should select inputGroup', () => {
    component.elementModel = new DropListElement({
      type: 'drop-list',
      id: 'test',
      width: 0,
      height: 0
    });
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('inputGroup');
  });

  it('should select inputGroup', () => {
    component.elementModel = new SliderElement({
      type: 'slider',
      id: 'test',
      width: 0,
      height: 0
    });
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('inputGroup');
  });

  it('should select inputGroup', () => {
    component.elementModel = new RadioButtonGroupElement({
      type: 'radio-group-images',
      id: 'test',
      width: 0,
      height: 0
    });
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('inputGroup');
  });

  it('should select textInputGroup', () => {
    component.elementModel = new TextFieldElement({
      type: 'text-field',
      id: 'test',
      width: 0,
      height: 0
    });
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('textInputGroup');
  });

  it('should select textInputGroup', () => {
    component.elementModel = new TextAreaElement({
      type: 'text-area',
      id: 'test',
      width: 0,
      height: 0
    });
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('textInputGroup');
  });

  it('should select textInputGroup', () => {
    component.elementModel = new SpellCorrectElement({
      type: 'spell-correct',
      id: 'test',
      width: 0,
      height: 0
    });
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('textInputGroup');
  });

  it('should select mediaPlayerGroup', () => {
    component.elementModel = new AudioElement({
      type: 'audio',
      id: 'test',
      width: 0,
      height: 0
    });
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('mediaPlayerGroup');
  });

  it('should select mediaPlayerGroup', () => {
    component.elementModel = new VideoElement({
      type: 'video',
      id: 'test',
      width: 0,
      height: 0
    });
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('mediaPlayerGroup');
  });

  it('should select compoundGroup', () => {
    component.elementModel = new LikertElement({
      type: 'likert',
      id: 'test',
      width: 0,
      height: 0
    });
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('compoundGroup');
  });

  it('should select mediaPlayerGroup', () => {
    component.elementModel = new ClozeElement({
      type: 'cloze',
      id: 'test',
      width: 0,
      height: 0
    });
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('compoundGroup');
  });

  it('should select no group (undefined)', () => {
    component.elementModel = new FrameElement({
      type: 'frame',
      id: 'test',
      width: 0,
      height: 0
    });
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual(undefined);
  });

  it('should select interactiveGroup', () => {
    component.elementModel = new ImageElement({
      type: 'image',
      id: 'test',
      width: 0,
      height: 0
    });
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('interactiveGroup');
  });

  it('should select interactiveGroup', () => {
    component.elementModel = new ButtonElement({
      type: 'button',
      id: 'test',
      width: 0,
      height: 0
    });
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('interactiveGroup');
  });

});
