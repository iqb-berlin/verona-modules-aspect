import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementBaseGroupComponent } from 'player/src/app/components/element-base-group/element-base-group.component';


describe('ElementBaseGroupComponent', () => {
  let component: ElementBaseGroupComponent;
  let fixture: ComponentFixture<ElementBaseGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ElementBaseGroupComponent
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ElementBaseGroupComponent);
    component = fixture.componentInstance;
    component.elementModel = {
      type: 'frame',
      id: 'test',
      width: 0,
      height: 0,
      styling: {}
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
