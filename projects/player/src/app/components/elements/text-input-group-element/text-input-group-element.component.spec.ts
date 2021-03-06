import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextInputGroupElementComponent } from './text-input-group-element.component';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { PlayerTranslateLoader } from 'player/src/app/classes/player-translate-loader';
import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CastPipe } from 'player/src/app/pipes/cast.pipe';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FloatingKeypadComponent } from 'player/src/app/components/floating-keypad/floating-keypad.component';
import { TextFieldElement } from 'common/models/elements/input-elements/text-field';

describe('TextInputGroupElementComponent', () => {
  let component: TextInputGroupElementComponent;
  let fixture: ComponentFixture<TextInputGroupElementComponent>;
  let mockUnitStateService: UnitStateService;

  @Component({ selector: 'aspect-text-field', template: '' })
  class TextFieldStubComponent {
    @Input() elementModel!: TextFieldElement;
    @Input() parentForm!: FormGroup;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TextInputGroupElementComponent,
        FloatingKeypadComponent,
        TextFieldStubComponent,
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
    fixture = TestBed.createComponent(TextInputGroupElementComponent);
    spyOn(mockUnitStateService, 'registerElement');
    spyOn(mockUnitStateService, 'getElementCodeById').withArgs('test').and
      .returnValue({ id: 'test', status: 'NOT_REACHED', value: 'test' });
    component = fixture.componentInstance;
    component.elementModel = new TextFieldElement({
      type: 'text-field',
      id: 'test',
      width: 0,
      height: 0
    });
    fixture.detectChanges();

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
