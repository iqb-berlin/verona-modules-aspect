import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Section } from 'common/models/section';
import { MeasurePipe } from 'common/pipes/measure.pipe';
import { SectionComponent } from './section.component';

describe('SectionComponent', () => {
  let component: SectionComponent;
  let fixture: ComponentFixture<SectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        SectionComponent, MeasurePipe
      ]
    })
      .compileComponents();
  });

  beforeEach(async () => {
    fixture = TestBed.createComponent(SectionComponent);
    component = fixture.componentInstance;
    component.section = new Section({
      elements: [],
      height: 400,
      backgroundColor: '#ffffff',
      dynamicPositioning: true,
      autoColumnSize: true,
      autoRowSize: true,
      gridColumnSizes: '1fr 1fr',
      gridRowSizes: '1fr'
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
