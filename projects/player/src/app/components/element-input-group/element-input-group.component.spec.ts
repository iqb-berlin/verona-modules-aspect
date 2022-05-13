import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementInputGroupComponent } from './element-input-group.component';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { PlayerTranslateLoader } from 'player/src/app/classes/player-translate-loader';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Component, Input } from '@angular/core';
import { UIElement } from 'common/interfaces/elements';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CastPipe } from 'player/src/app/pipes/cast.pipe';
import { UnitStateService } from 'player/src/app/services/unit-state.service';

describe('ElementInputGroupComponent', () => {
  let component: ElementInputGroupComponent;
  let fixture: ComponentFixture<ElementInputGroupComponent>;
  let mockUnitStateService: UnitStateService;

  @Component({ selector: 'aspect-radio-button-group', template: '' })
  class RadioStubComponent {
    @Input() elementModel!: UIElement;
    @Input() parentForm!: FormGroup;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ElementInputGroupComponent,
        RadioStubComponent,
        CastPipe
      ],
      imports: [
        ReactiveFormsModule,
        MatSnackBarModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: PlayerTranslateLoader
          }
        })
      ],
      providers: [TranslateService]
    })
      .compileComponents();
  });

  beforeEach(() => {
    mockUnitStateService = TestBed.inject(UnitStateService);
    fixture = TestBed.createComponent(ElementInputGroupComponent);
    spyOn(mockUnitStateService, 'registerElement')
      .withArgs('test', 0, document.createElement('div'), 1);
    spyOn(mockUnitStateService, 'getElementCodeById').withArgs('test').and
      .returnValue({ id: 'test', status: 'NOT_REACHED', value: 0 });
    component = fixture.componentInstance;
    component.elementModel = {
      type: 'radio',
      id: 'test',
      width: 0,
      height: 0
    };
    fixture.detectChanges();

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
