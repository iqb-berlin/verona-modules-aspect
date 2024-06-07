import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatStepperModule } from '@angular/material/stepper';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgForOf, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Section } from 'common/models/section';
import { SizeInputPanelComponent } from 'editor/src/app/components/util/size-input-panel.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { BorderStyles, PropertyGroupGenerators } from 'common/models/elements/property-group-interfaces';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'aaspect-table-wizard',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    MatDialogModule,
    MatButtonModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    TranslateModule,
    SizeInputPanelComponent,
    MatCheckboxModule,
    MatRadioModule,
    FormsModule,
    MatIconModule,
    MatSelectModule
  ],
  templateUrl: 'table-wizard.component.html',
  styles: `
    :host {display: flex; flex-direction: column; height: 100%;}
    fieldset {display: flex; flex-direction: column; align-items: flex-start;}
    aspect-size-input-panel {width: 100%;}
    .wrapper {display: flex;}
    .x-y-inputs {display: flex; flex-direction: row; gap: 20px;}
    :host ::ng-deep .mat-horizontal-stepper-content {display: flex; flex-direction: column;}
    :host ::ng-deep .mat-horizontal-stepper-content > button {align-self: center; margin: 15px;}
    .table-props-page {display: flex; flex-direction: column;}
    .table-props-page > mat-form-field {width: 220px;}
  `
})
export class TableWizardComponent {
  newSection: Section;
  useWholeGrid: boolean = true;
  createNewGrid: boolean = true;
  tableStartRow: number;
  tableStartColumn: number;
  tableEndRow: number;
  tableEndColumn: number;
  borderStyle: BorderStyles = PropertyGroupGenerators.generateBorderStylingProps({ borderWidth: 3 });

  selectedStep: number = 0;

  activeSection: Section;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { section: Section }) {
    this.newSection = new Section({
      ...data.section,
      autoColumnSize: false,
      autoRowSize: false,
      gridColumnSizes: [{
        value: 1,
        unit: 'fr'
      }, {
        value: 1,
        unit: 'fr'
      }],
      gridRowSizes: [{
        value: 1,
        unit: 'fr'
      }, {
        value: 1,
        unit: 'fr'
      }]
    });
    this.activeSection = this.createNewGrid ? this.newSection : this.data.section;
    this.tableStartRow = 0;
    this.tableStartColumn = 0;
    // console.log('llll', this.activeSection.gridColumnSizes.length);
    this.tableEndRow = this.activeSection.gridColumnSizes.length - 1;
    this.tableEndColumn = this.activeSection.gridRowSizes.length - 1;
  }

  modifySizeArray(property: 'gridColumnSizes' | 'gridRowSizes', newLength: number): void {
  // modifySizeArray(sizeArray: { value: number; unit: string }[], newLength: number): void {
    const sizeArray: { value: number; unit: string }[] = property === 'gridColumnSizes' ?
      this.newSection.gridColumnSizes : this.newSection.gridRowSizes;

    let newArray = [];
    if (newLength < sizeArray.length) {
      newArray = sizeArray.slice(0, newLength);
    } else {
      newArray.push(
        ...sizeArray,
        ...Array(newLength - sizeArray.length).fill({ value: 1, unit: 'fr' })
      );
    }
    this.newSection[property] = newArray;
    // this.updateModel(property, newArray);
    this.updateDimensionFields();
  }

  changeGridSize(property: string, index: number, newValue: { value: number; unit: string }): void {
    const sizeArray: { value: number; unit: string }[] = property === 'gridColumnSizes' ?
      this.newSection.gridColumnSizes : this.newSection.gridRowSizes;
    sizeArray[index] = newValue;
    // this.updateModel(property, [...sizeArray]);
    this.newSection[property] = [...sizeArray];
  }

  nextStep() {
    this.selectedStep += 1;
  }

  previousStep() {
    this.selectedStep -= 1;
  }

  setActiveSection() {
    this.activeSection = this.createNewGrid ? this.newSection : this.data.section;
    this.updateDimensionFields();
    console.log('setActiveSection tableEndRow', this.tableEndRow);
  }

  updateDimensionFields(): void {
    this.tableEndRow = this.activeSection.gridColumnSizes.length - 1;
    this.tableEndColumn = this.activeSection.gridRowSizes.length - 1;
  }
}
