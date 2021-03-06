import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FloatingMarkingBarComponent } from './floating-marking-bar.component';
import * as text_130 from '../../../../../../test-data/element-models/text_130.json';
import { OverlayModule } from '@angular/cdk/overlay';
import { TextComponent } from 'common/components/text/text.component';

describe('FloatingMarkingBarComponent', () => {
  let component: FloatingMarkingBarComponent;
  let fixture: ComponentFixture<FloatingMarkingBarComponent>;
  let textComponentFixture: ComponentFixture<TextComponent>;
  let textComponent: TextComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FloatingMarkingBarComponent ],
      imports: [ OverlayModule ]
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
