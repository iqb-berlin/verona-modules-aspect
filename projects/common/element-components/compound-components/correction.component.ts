import { Component } from '@angular/core';
import { FormElementComponent } from '../../canvas-element-component.directive';

@Component({
  selector: 'app-correction',
  template: `
    <div>
      <p>
        {{$any(elementModel).text}}
      </p>
      <div *ngFor="let sentence of $any(elementModel).sentences"
           fxLayout="column">
        <div fxLayout="row">
          <div *ngFor="let word of sentence.split(' ');"
               fxLayout="column">
              <mat-form-field>
              <input matInput type="text">
              </mat-form-field>
              <div>
                  {{word}}
              </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    'mat-form-field {margin: 5px}'
  ]
})
export class CorrectionComponent extends FormElementComponent { }
