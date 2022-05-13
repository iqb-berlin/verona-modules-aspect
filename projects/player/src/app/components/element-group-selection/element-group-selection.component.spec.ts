import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementGroupSelectionComponent } from './element-group-selection.component';
import { Component, Input } from '@angular/core';
import { UIElement } from 'common/interfaces/elements';

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
    component.elementModel = {
      type: 'checkbox',
      id: 'test',
      width: 0,
      height: 0
    };
    expect(component).toBeTruthy();
  });

  it('should select textGroup', () => {
    component.elementModel = {
      type: 'text',
      id: 'test',
      width: 0,
      height: 0
    };
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('textGroup');
  });

  it('should select inputGroup', () => {
    component.elementModel = {
      type: 'checkbox',
      id: 'test',
      width: 0,
      height: 0
    };
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('inputGroup');
  });

  it('should select inputGroup', () => {
    component.elementModel = {
      type: 'checkbox',
      id: 'test',
      width: 0,
      height: 0
    };
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('inputGroup');
  });

  it('should select inputGroup', () => {
    component.elementModel = {
      type: 'radio',
      id: 'test',
      width: 0,
      height: 0
    };
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('inputGroup');
  });

  it('should select inputGroup', () => {
    component.elementModel = {
      type: 'dropdown',
      id: 'test',
      width: 0,
      height: 0
    };
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('inputGroup');
  });

  it('should select inputGroup', () => {
    component.elementModel = {
      type: 'drop-list',
      id: 'test',
      width: 0,
      height: 0
    };
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('inputGroup');
  });

  it('should select inputGroup', () => {
    component.elementModel = {
      type: 'slider',
      id: 'test',
      width: 0,
      height: 0
    };
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('inputGroup');
  });

  it('should select inputGroup', () => {
    component.elementModel = {
      type: 'radio-group-images',
      id: 'test',
      width: 0,
      height: 0
    };
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('inputGroup');
  });

  it('should select textInputGroup', () => {
    component.elementModel = {
      type: 'text-field',
      id: 'test',
      width: 0,
      height: 0
    };
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('textInputGroup');
  });

  it('should select textInputGroup', () => {
    component.elementModel = {
      type: 'text-area',
      id: 'test',
      width: 0,
      height: 0
    };
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('textInputGroup');
  });

  it('should select textInputGroup', () => {
    component.elementModel = {
      type: 'spell-correct',
      id: 'test',
      width: 0,
      height: 0
    };
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('textInputGroup');
  });

  it('should select mediaPlayerGroup', () => {
    component.elementModel = {
      type: 'audio',
      id: 'test',
      width: 0,
      height: 0
    };
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('mediaPlayerGroup');
  });

  it('should select mediaPlayerGroup', () => {
    component.elementModel = {
      type: 'video',
      id: 'test',
      width: 0,
      height: 0
    };
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('mediaPlayerGroup');
  });

  it('should select compoundGroup', () => {
    component.elementModel = {
      type: 'likert',
      id: 'test',
      width: 0,
      height: 0
    };
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('compoundGroup');
  });

  it('should select mediaPlayerGroup', () => {
    component.elementModel = {
      type: 'cloze',
      id: 'test',
      width: 0,
      height: 0
    };
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('compoundGroup');
  });

  it('should select no group (undefined)', () => {
    component.elementModel = {
      type: 'frame',
      id: 'test',
      width: 0,
      height: 0
    };
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual(undefined);
  });

  it('should select interactiveGroup', () => {
    component.elementModel = {
      type: 'image',
      id: 'test',
      width: 0,
      height: 0
    };
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('interactiveGroup');
  });

  it('should select interactiveGroup', () => {
    component.elementModel = {
      type: 'button',
      id: 'test',
      width: 0,
      height: 0
    };
    fixture.detectChanges();
    expect(component.selectedGroup).toEqual('interactiveGroup');
  });

});
