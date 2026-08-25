// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { TextComponent } from 'common/components/text-group-elements/text/text.component';
import { APIService } from 'common/shared.module';
import { Pipe, PipeTransform, SimpleChange } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { TextElement } from 'common/models/elements/text';
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

  @Pipe({
    name: 'hasReturnKey',
    standalone: false
  })
  class MockHasReturnKeyPipe implements PipeTransform {
    transform(): boolean {
      return false;
    }
  }

  const setHighlightableColors = (yellow: boolean, turquoise: boolean, orange: boolean): void => {
    textComponent.elementModel.highlightableYellow = yellow;
    textComponent.elementModel.highlightableTurquoise = turquoise;
    textComponent.elementModel.highlightableOrange = orange;
  };

  /* The text element covers the upper left corner of a viewport that is higher than the element. */
  const openMarkingBar = (markingBarPosition: { top: number, left: number },
                          scrollTop: number = 0): void => {
    component.textComponentRect = {
      top: 0, left: 0, width: 1000, height: 100
    } as DOMRect;
    component.markingBarPosition = markingBarPosition;
    component.textComponentContainerScrollTop = scrollTop;
    component.isMarkingBarOpen = true;
    component.ngOnChanges({ isMarkingBarOpen: new SimpleChange(false, true, false) });
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockHasReturnKeyPipe,
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
    /* What this spec drives is the highlighting, through setHighlightableColors below -- the element
       itself needs nothing beyond what it brings (#1171). */
    textComponent.elementModel = new TextElement({ id: 'text_1' });

    fixture = TestBed.createComponent(FloatingMarkingBarComponent);
    component = fixture.componentInstance;
    component.elementComponent = textComponent;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start at the origin of the text element', () => {
    expect(component.overlayPositions).toEqual([{
      originX: 'start',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'top',
      offsetX: 0,
      offsetY: 0
    }]);
  });

  it('should place the bar below the marked text', () => {
    setHighlightableColors(true, false, false);

    openMarkingBar({ top: 10, left: 20 });

    expect(component.overlayPositions[0].offsetX).toBe(20);
    expect(component.overlayPositions[0].offsetY).toBe(-50);
  });

  it('should keep the bar inside the text element on the right', () => {
    setHighlightableColors(true, false, false);

    openMarkingBar({ top: 10, left: 950 });

    /* Element width 1000 minus bar width (1 + 1 colour) * 60. */
    expect(component.overlayPositions[0].offsetX).toBe(880);
  });

  it('should reserve space for every offered marking colour', () => {
    setHighlightableColors(true, true, true);

    openMarkingBar({ top: 10, left: 950 });

    /* Element width 1000 minus bar width (1 + 3 colours) * 60. */
    expect(component.overlayPositions[0].offsetX).toBe(760);
  });

  it('should place the bar at the marking position when there is enough space below', () => {
    setHighlightableColors(true, false, false);

    openMarkingBar({ top: -20, left: 20 });

    expect(component.overlayPositions[0].offsetY).toBe(-5);
  });

  it('should take the scroll position of the text container into account', () => {
    setHighlightableColors(true, false, false);

    openMarkingBar({ top: -20, left: 20 }, 30);

    expect(component.overlayPositions[0].offsetY).toBe(25);
  });

  it('should not reposition the bar while it is closed', () => {
    setHighlightableColors(true, false, false);
    component.isMarkingBarOpen = false;

    component.ngOnChanges({ isMarkingBarOpen: new SimpleChange(true, false, false) });

    expect(component.overlayPositions[0].offsetX).toBe(0);
    expect(component.overlayPositions[0].offsetY).toBe(0);
  });

  it('should forward changed marking data', () => {
    const markingData: unknown[] = [];
    component.markingDataChanged.subscribe(data => markingData.push(data));
    const data = {
      active: true, mode: 'mark' as const, color: '#f9f871', colorName: 'yellow'
    };

    component.markingDataChanged.emit(data);

    expect(markingData).toEqual([data]);
  });
});
