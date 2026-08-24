/* eslint-disable max-classes-per-file */
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ElementComponent } from 'common/directives/element-component.directive';
import { FrameElement } from 'common/models/elements/base-group-elements/frame';
import { APIService } from 'common/shared.module';
import { ComponentRegistry } from 'common/utils/component-registry';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import {
  BaseGroupElementComponent
} from 'player/src/app/components/elements/base-group-element/base-group-element.component';

@Component({
  selector: 'aspect-frame-stub',
  template: '<span class="frame-stub"></span>',
  standalone: false
})
class FrameStubComponent extends ElementComponent {
  elementModel!: FrameElement;
}

describe('BaseGroupElementComponent', () => {
  let component: BaseGroupElementComponent;
  let fixture: ComponentFixture<BaseGroupElementComponent>;
  let unitStateService: SpyObj<UnitStateService>;
  let elementModel: FrameElement;

  class ApiStubService {
    // eslint-disable-next-line class-methods-use-this
    getResourceURL(): string {
      return 'assets';
    }
  }

  beforeEach(async () => {
    unitStateService = createSpyObj<UnitStateService>(['registerElementCode']);
    vi.spyOn(ComponentRegistry, 'getComponent').mockReturnValue(FrameStubComponent);

    await TestBed.configureTestingModule({
      declarations: [
        BaseGroupElementComponent,
        FrameStubComponent
      ],
      providers: [
        { provide: APIService, useClass: ApiStubService },
        { provide: UnitStateService, useValue: unitStateService }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    elementModel = new FrameElement({ id: 'frame_1', alias: 'frame_1' });
    fixture = TestBed.createComponent(BaseGroupElementComponent);
    component = fixture.componentInstance;
    component.elementModel = elementModel;
    component.pageIndex = 2;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should create the registered component for the element type', () => {
    fixture.detectChanges();

    expect(ComponentRegistry.getComponent).toHaveBeenCalledWith('frame');
    expect(component.baseElementComponent).toBeInstanceOf(FrameStubComponent);
    expect(component.baseElementComponent.elementModel).toBe(elementModel);
    expect(fixture.debugElement.query(By.css('.frame-stub'))).toBeTruthy();
  });

  it('should register the element without a value at the unit state service', () => {
    elementModel.isRelevantForPresentationComplete = false;

    fixture.detectChanges();

    expect(unitStateService.registerElementCode)
      .toHaveBeenCalledWith('frame_1', 'frame_1', null, component.baseElementComponent.domElement, null);
  });

  it('should register the page index for elements relevant for the presentation progress', () => {
    elementModel.isRelevantForPresentationComplete = true;

    fixture.detectChanges();

    expect(unitStateService.registerElementCode)
      .toHaveBeenCalledWith('frame_1', 'frame_1', null, component.baseElementComponent.domElement, 2);
  });
});
