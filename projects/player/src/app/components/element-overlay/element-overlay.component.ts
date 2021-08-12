import {
  Component, OnInit, Input, ComponentFactoryResolver,
  ViewChild, ViewContainerRef
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UnitUIElement } from '../../../../../common/unit';
import * as ComponentUtils from '../../../../../common/component-utils';
import { FormService } from '../../../../../common/form.service';
import { ValueChangeElement } from '../../../../../common/form';

@Component({
  selector: 'app-element-overlay',
  templateUrl: './element-overlay.component.html',
  styleUrls: ['./element-overlay.component.css']
})
export class ElementOverlayComponent implements OnInit {
  @Input() elementModel!: UnitUIElement;
  @Input() parentForm!: FormGroup;
  @Input() parentArrayIndex!: number;

  isInputElement!: boolean;
  elementForm!: FormGroup;
  private ngUnsubscribe = new Subject<void>();

  @ViewChild('elementComponentContainer',
    { read: ViewContainerRef, static: true }) private elementComponentContainer!: ViewContainerRef;

  constructor(private formService: FormService,
              private formBuilder: FormBuilder,
              private componentFactoryResolver: ComponentFactoryResolver) {
  }

  ngOnInit(): void {
    const elementComponentFactory =
      ComponentUtils.getComponentFactory(this.elementModel.type, this.componentFactoryResolver);
    const elementComponent = this.elementComponentContainer.createComponent(elementComponentFactory).instance;
    elementComponent.elementModel = this.elementModel;
    this.isInputElement = Object.prototype.hasOwnProperty.call(this.elementModel, 'required');
    if (this.isInputElement) {
      this.registerFormGroup();
      elementComponent.parentForm = this.elementForm;
      elementComponent.formValueChanged
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((changeElement: ValueChangeElement) => {
          this.formService.changeElementValue(changeElement);
        });
    }
  }

  private registerFormGroup() {
    this.elementForm = this.formBuilder.group({});
    this.formService.registerFormGroup({
      formGroup: this.elementForm,
      parentForm: this.parentForm,
      parentArray: 'elements',
      parentArrayIndex: this.parentArrayIndex
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
