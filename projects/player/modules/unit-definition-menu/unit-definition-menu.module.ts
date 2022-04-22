import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnitDefinitionMenuComponent } from './components/unit-definition-menu/unit-definition-menu.component';
import { MatMenuModule } from '@angular/material/menu';
import { SharedModule } from 'common/shared.module';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  declarations: [
    UnitDefinitionMenuComponent
  ],
  exports: [
    UnitDefinitionMenuComponent
  ],
  imports: [
    CommonModule,
    MatMenuModule,
    SharedModule,
    MatDividerModule
  ]
})
export class UnitDefinitionMenuModule { }
