import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SectionComponent } from './section.component';
import { Section } from 'common/models/section';

describe('SectionComponent', () => {
  let component: SectionComponent;
  let fixture: ComponentFixture<SectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        SectionComponent
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
      gridRowSizes: '1fr',
      activeAfterID: ''
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
