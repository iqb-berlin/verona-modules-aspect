import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslateModule } from '@ngx-translate/core';
import { Pipe, PipeTransform } from '@angular/core';
import {
  Hotspot, HotspotImageElement, HotspotImageProperties
} from 'common/models/elements/input-group-elements/hotspot-image';
import { SafeResourceUrlPipe } from 'common/pipes/safe-resource-url.pipe';
import { MathAtanPipe } from 'common/pipes/math-atan.pipe';
import { MathDegreesPipe } from 'common/pipes/math-degrees.pipe';
import { HotspotImageComponent } from './hotspot-image.component';

@Pipe({ name: 'errorTransform', standalone: false })
class MockErrorTransformPipe implements PipeTransform {
  transform(): string { return 'Error'; }
}

describe('HotspotImageComponent', () => {
  let component: HotspotImageComponent;
  let fixture: ComponentFixture<HotspotImageComponent>;

  const createHotspot = (shape: Hotspot['shape']): Hotspot => ({
    top: 10,
    left: 10,
    width: 20,
    height: 20,
    shape,
    borderWidth: 0,
    borderColor: '#000000',
    backgroundColor: '#ff0000',
    rotation: 0,
    value: false,
    readOnly: false
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        HotspotImageComponent,
        SafeResourceUrlPipe,
        MathAtanPipe,
        MathDegreesPipe,
        MockErrorTransformPipe
      ],
      imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HotspotImageComponent);
    component = fixture.componentInstance;
    component.elementModel = new HotspotImageElement({
      type: 'hotspot-image',
      id: 'test-id',
      alias: 'test-alias',
      value: [createHotspot('ellipse'), createHotspot('triangle')],
      src: 'data:image/png;base64,'
    } as Partial<HotspotImageProperties>);
    component.parentForm = new UntypedFormGroup({
      'test-id': new UntypedFormControl(component.elementModel.value)
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render anything without src', () => {
    component.elementModel.src = null;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.image-container')).toBeNull();
  });

  it('should render hotspots according to their shape', () => {
    expect(fixture.nativeElement.querySelectorAll('.hotspot.circle').length).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('.triangle-container').length).toBe(1);
  });

  it('should toggle the hotspot value with setHotspotValue', () => {
    component.setHotspotValue(0);
    expect(component.elementFormControl.value[0].value).toBe(true);
    component.setHotspotValue(0);
    expect(component.elementFormControl.value[0].value).toBe(false);
  });

  it('should toggle the hotspot value on click', () => {
    const ellipseHotspot = fixture.nativeElement.querySelector('.hotspot.circle');
    ellipseHotspot.click();
    expect(component.elementFormControl.value[0].value).toBe(true);
  });

  it('should NOT toggle the value of a readOnly hotspot on click', () => {
    component.elementModel.value[0].readOnly = true;
    fixture.detectChanges();
    const ellipseHotspot = fixture.nativeElement.querySelector('.hotspot.circle');
    ellipseHotspot.click();
    expect(component.elementFormControl.value[0].value).toBe(false);
    expect(ellipseHotspot.classList).not.toContain('active-hotspot');
  });
});
