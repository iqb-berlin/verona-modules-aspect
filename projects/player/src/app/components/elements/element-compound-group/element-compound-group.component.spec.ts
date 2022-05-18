import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ElementCompoundGroupComponent
} from './element-compound-group.component';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { PlayerTranslateLoader } from 'player/src/app/classes/player-translate-loader';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FloatingKeypadComponent } from 'player/src/app/components/floating-keypad/floating-keypad.component';
import { Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CastPipe } from 'player/src/app/pipes/cast.pipe';
import { LikertElement } from 'common/models/elements/compound-elements/likert/likert';

describe('ElementCompoundGroupComponent', () => {
  let component: ElementCompoundGroupComponent;
  let fixture: ComponentFixture<ElementCompoundGroupComponent>;

  @Component({ selector: 'aspect-likert', template: '' })
  class LikertStubComponent {
    @Input() elementModel!: LikertElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ElementCompoundGroupComponent,
        FloatingKeypadComponent,
        LikertStubComponent,
        CastPipe
      ],
      imports: [
        FormsModule,
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
    fixture = TestBed.createComponent(ElementCompoundGroupComponent);
    component = fixture.componentInstance;
    component.elementModel = new LikertElement({
      type: 'likert',
      id: 'test',
      width: 0,
      height: 0,
      rows: []
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
