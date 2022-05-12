import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnitMenuComponent } from './components/unit-menu/unit-menu.component';
import { MatMenuModule } from '@angular/material/menu';
import { SharedModule } from 'common/shared.module';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  declarations: [
    UnitMenuComponent
  ],
  exports: [
    UnitMenuComponent
  ],
  imports: [
    CommonModule,
    MatMenuModule,
    SharedModule,
    MatDividerModule
  ]
})
export class UnitMenuModule { }
