// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CdkOverlayOrigin, OverlayModule } from '@angular/cdk/overlay';
import { TextComponent } from 'common/components/text/text.component';
import { APIService } from 'common/shared.module';
import { Pipe, PipeTransform } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { ElementComponent } from 'common/directives/element-component.directive';
import * as text_130 from '../../../../../../test-data/element-models/text_130.json';
import { FloatingMarkingBarComponent } from './floating-marking-bar.component';

describe('FloatingMarkingBarComponent', () => {
  let component: FloatingMarkingBarComponent;
  let fixture: ComponentFixture<FloatingMarkingBarComponent>;
  let textComponentFixture: ComponentFixture<TextComponent>;
  let textComponent: TextComponent;
  class ApiStubService {
    // eslint-disable-next-line class-methods-use-this
    getResourceURL(): string {
      return 'assets';
    }
  }

  @Pipe({ name: 'hasReturnKey' })
  class MockHasReturnKeyPipe implements PipeTransform {
    transform(): boolean {
      return false;
    }
  }

  @Pipe({ name: 'asOverlayOrigin' })
  class MockAsOverlayOriginPipe implements PipeTransform {
    transform(elementComponent: ElementComponent): CdkOverlayOrigin {
      return elementComponent as CdkOverlayOrigin;
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockHasReturnKeyPipe,
        MockAsOverlayOriginPipe,
        FloatingMarkingBarComponent
      ],
      imports: [
        OverlayModule,
        MatDialogModule
      ],
      providers: [{ provide: APIService, useClass: ApiStubService }]
    })
      .compileComponents();
  });

  beforeEach(() => {
    textComponentFixture = TestBed.createComponent(TextComponent);
    textComponent = textComponentFixture.componentInstance;
    textComponent.elementModel = JSON.parse(JSON.stringify(text_130));

    fixture = TestBed.createComponent(FloatingMarkingBarComponent);
    component = fixture.componentInstance;
    component.elementComponent = textComponent;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
