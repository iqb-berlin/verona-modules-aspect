import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FrameElement, FrameProperties } from 'common/models/elements/frame';
import { FrameComponent } from './frame.component';

describe('FrameComponent', () => {
  let component: FrameComponent;
  let fixture: ComponentFixture<FrameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FrameComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FrameComponent);
    component = fixture.componentInstance;
    component.elementModel = new FrameElement({
      type: 'frame',
      id: 'test-id',
      alias: 'test-alias',
      hasBorderTop: true,
      hasBorderBottom: false,
      hasBorderLeft: true,
      hasBorderRight: false,
      styling: {
        borderWidth: 2,
        borderColor: 'blue',
        borderStyle: 'dotted',
        borderRadius: 5,
        backgroundColor: 'red'
      }
    } as Partial<FrameProperties>);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply border styles only to activated sides', () => {
    const frameDiv = fixture.nativeElement.querySelector('div') as HTMLDivElement;
    expect(frameDiv.style.borderTopStyle).toBe('dotted');
    expect(frameDiv.style.borderLeftStyle).toBe('dotted');
    expect(frameDiv.style.borderBottomStyle).toBe('none');
    expect(frameDiv.style.borderRightStyle).toBe('none');
  });

  it('should apply styling properties', () => {
    const frameDiv = fixture.nativeElement.querySelector('div') as HTMLDivElement;
    expect(frameDiv.style.borderTopWidth).toBe('2px');
    expect(frameDiv.style.borderTopColor).toBe('blue');
    expect(frameDiv.style.borderRadius).toBe('5px');
    expect(frameDiv.style.backgroundColor).toBe('red');
  });

  it('should reduce width and height by twice the border width', () => {
    const frameDiv = fixture.nativeElement.querySelector('div') as HTMLDivElement;
    expect(frameDiv.style.width).toBe('calc(100% - 4px)');
    expect(frameDiv.style.height).toBe('calc(100% - 4px)');
  });
});
