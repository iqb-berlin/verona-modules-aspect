import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FloatingKeypadComponent } from 'player/src/app/components/floating-keypad/floating-keypad.component';
import { Component, Input } from '@angular/core';
import { UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CastPipe } from 'player/src/app/pipes/cast.pipe';
import { LikertElement } from 'common/models/elements/compound-elements/likert/likert';
import {
  CompoundGroupElementComponent
} from './compound-group-element.component';

describe('CompoundGroupElementComponent', () => {
  let component: CompoundGroupElementComponent;
  let fixture: ComponentFixture<CompoundGroupElementComponent>;

  @Component({ selector: 'aspect-likert', template: '' })
  class LikertStubComponent {
    @Input() elementModel!: LikertElement;
    @Input() parentForm!: UntypedFormGroup;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        CompoundGroupElementComponent,
        FloatingKeypadComponent,
        LikertStubComponent,
        CastPipe
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatSnackBarModule
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompoundGroupElementComponent);
    component = fixture.componentInstance;
    component.elementModel = new LikertElement({ id: 'id', alias: 'alias' });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
